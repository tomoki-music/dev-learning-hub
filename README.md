<!-- markdownlint-disable MD033 -->
# Music Event Hub

音楽コミュニティ向けの、シンプルな**イベント管理アプリ**です。
セッション・ライブ出演・ワークショップ・オフラインミートアップなどのイベントを一覧・検索・登録・編集・削除できます。

> 個人開発の学習用ポートフォリオとして、既存のRuby on Railsプロジェクトとは完全に独立した新規リポジトリとして構築しました。

## 開発目的

普段はVue.js・TypeScript・Ruby on Railsで開発していますが、**Next.js（App Router）とReact Server Componentsの実務レベルの理解**を得るために、ゼロから設計・実装しました。単に動くものを作るだけでなく、

- Server ComponentとClient Componentを適切に使い分けること
- Next.js特有のデータ取得・ルーティング・API実装のパターンを理解すること
- Vue.js / Ruby on Railsとの設計思想の違いを言語化できるようにすること

を目的としています。本READMEにも、実装の随所でVue.js/Railsとの対比を記載しています。

## 使用技術

| カテゴリ | 技術 |
|---|---|
| フレームワーク | [Next.js 16](https://nextjs.org/)（App Router / Turbopack） |
| UIライブラリ | [React 19](https://react.dev/) |
| 言語 | TypeScript 5（`strict` モード） |
| スタイリング | [Tailwind CSS v4](https://tailwindcss.com/)（CSSベースの`@theme`設定） |
| ORM | [Prisma 7](https://www.prisma.io/)（Driver Adapter方式） |
| データベース | SQLite（`better-sqlite3` ドライバ経由） |
| バリデーション | [Zod](https://zod.dev/)（クライアント・サーバー共有スキーマ） |
| テスト | [Vitest](https://vitest.dev/) |
| Lint | ESLint（`eslint-config-next`） |
| パッケージ管理 | npm |

## 実装機能

- **トップページ**（`/`）: アプリ紹介、イベント一覧への導線
- **イベント一覧**（`/events`）: カード形式の一覧、キーワード検索、募集中／受付終了の絞り込み
- **イベント詳細**（`/events/[id]`）: 詳細情報の表示、存在しないIDはNot Found表示
- **イベント登録**（`/events/new`）: 必須入力チェック・定員の数値チェック・エラーメッセージ・二重送信防止
- **イベント編集**（`/events/[id]/edit`）: 登録済みイベントの内容を更新
- **イベント削除**: 詳細ページから、確認ダイアログを経て削除
- **API（Route Handlers）**: `GET/POST /api/events`、`GET/PUT/DELETE /api/events/[id]`

### 募集状況（RECRUITING / CLOSED）の考え方

`Event.status` は主催者による早期締切のための手動フラグですが、実際にカード・詳細ページへ表示される募集状況は
**「`status` が `CLOSED` か、または `participantCount >= capacity` か」** で導出しています（[`src/lib/events.ts`](src/lib/events.ts) の `deriveEventStatus`）。
これはRailsでいう `Event#recruiting?` のようなモデルの concern メソッドに相当し、この判定ロジックを1箇所にまとめることで、
一覧・詳細・APIのすべてで同じ基準を共有しています。

## セットアップ手順

### 前提

- Node.js **20.9以降**（`nvm install` で `.nvmrc` の Node 20.20.2 を利用できます）
- npm

```bash
# Node バージョンを合わせる（nvm利用時）
nvm use

# 依存パッケージのインストール
# postinstallでPrisma Clientの生成（npx prisma generate）も自動実行されます
npm install

# 環境変数ファイルを用意
cp .env.example .env
```

### データベース初期化手順

SQLiteはファイルベースのDBなので、追加のミドルウェア起動は不要です。

```bash
# マイグレーションを適用してDBファイル（prisma/dev.db）を作成
npm run db:migrate

# 開発確認用データを投入
npm run db:seed
```

> **Prisma 7の注意点**: v6までと異なり、`prisma migrate dev` はクライアント自動生成もシード自動実行も**行いません**。
> `npm install`（`postinstall`）でクライアント生成、`npm run db:seed` でシードを、それぞれ明示的に実行する必要があります。

DBの中身をリセットしたい場合:

```bash
npm run db:reset   # migrate reset（DB再作成 + マイグレーション再適用）
npm run db:seed    # シードは reset 後も自動実行されないため個別に実行
```

Prisma Studio（GUIでDBの中身を見る）:

```bash
npm run db:studio
```

## 開発サーバーの起動方法

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いてください。

## テスト・Lint・buildの実行方法

```bash
# 型チェック（tsc --noEmit）
npm run typecheck

# ESLint
npm run lint

# 単体テスト（Vitest）
npm run test

# 単体テスト（watchモード）
npm run test:watch

# 本番ビルド
npm run build

# 本番ビルドの起動確認
npm run start
```

### テストのスコープについて

`src/lib/*.test.ts` に、フレームワークに依存しないロジック（募集状況の判定 `deriveEventStatus`、フォームバリデーション `validateEventForm` など）の単体テストを追加しています。

Server/Client ComponentのレンダリングテストやE2Eテスト（Playwright等）は、Prismaのモックやブラウザ操作の自動化など**セットアップコストが本アプリの規模に見合わない**と判断し、今回はスコープ外としました（詳細は「今後の改善予定」）。

## ディレクトリ構成

```text
music-event-hub/
├── prisma/
│   ├── schema.prisma        # Eventモデル定義
│   ├── seed.ts               # 開発用シードデータ
│   └── migrations/           # マイグレーション履歴
├── src/
│   ├── app/
│   │   ├── page.tsx                    # トップページ
│   │   ├── layout.tsx                  # 共通レイアウト（Header/Footer組み込み）
│   │   ├── not-found.tsx               # 404ページ
│   │   ├── globals.css                 # Tailwind v4のテーマ定義（@theme）
│   │   ├── events/
│   │   │   ├── page.tsx                # イベント一覧（検索・絞り込み対応）
│   │   │   ├── new/page.tsx            # イベント登録
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # イベント詳細
│   │   │       └── edit/page.tsx       # イベント編集
│   │   └── api/
│   │       └── events/
│   │           ├── route.ts            # GET / POST /api/events
│   │           └── [id]/route.ts       # GET / PUT / DELETE /api/events/[id]
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── events/
│   │       ├── EventCard.tsx
│   │       ├── EventList.tsx
│   │       ├── EventSearch.tsx         # "use client"（検索・絞り込みUI）
│   │       ├── EventStatusBadge.tsx
│   │       ├── EventForm.tsx           # "use client"（登録・編集フォーム）
│   │       └── DeleteEventButton.tsx   # "use client"（削除確認・実行）
│   ├── lib/
│   │   ├── prisma.ts          # PrismaClientシングルトン（+ SQLite driver adapter）
│   │   ├── events.ts          # 募集状況の導出・日付フォーマットなど
│   │   ├── event-queries.ts   # id指定でのイベント取得（詳細・編集ページ共通）
│   │   └── validation.ts      # Zodスキーマ（クライアント・サーバー共有）
│   └── types/
│       └── event.ts           # EventStatus / EventRecord / フォーム型
└── vitest.config.mts
```

## Server ComponentとClient Componentの使い分け

App Routerでは、**すべてのコンポーネントはデフォルトでServer Component**です。ファイル先頭に `"use client"` を書いたときだけ、そのコンポーネント（と子コンポーネント）がブラウザ側でも実行されます。

このアプリでは「ブラウザ側の状態管理やイベントハンドラが必要かどうか」だけを基準に分けました。

| コンポーネント | 種別 | 理由 |
|---|---|---|
| `Header` / `Footer` / トップページ | Server | 静的な表示のみで、状態もイベントハンドラも不要 |
| `/events`（一覧ページ本体） | Server | Prisma で直接DBを検索し、結果をHTMLとして返すだけ |
| `EventCard` / `EventList` / `EventStatusBadge` | Server | propsを受け取って表示するだけの「dumbコンポーネント」 |
| `/events/[id]`（詳細ページ本体） | Server | データ取得と表示のみ。編集・削除ボタンだけがクライアント |
| `EventSearch` | **Client** | 入力値をstateで保持し、URLのクエリパラメータを書き換える |
| `EventForm` | **Client** | フォーム入力のstate管理、バリデーション、`fetch`によるAPI呼び出し |
| `DeleteEventButton` | **Client** | 確認ダイアログとクリックイベント、削除APIの呼び出し |

**ポイント**: ページ全体を `"use client"` にするのではなく、インタラクティブな部分だけを最小単位で切り出しています。
これにより `/events/[id]` のようなページでも、実際にブラウザへ送られるJavaScriptは「削除ボタン」の分だけで済みます。

## Vue.jsとの主な違い

普段Vue.js（+ Nuxt想定なしのSPA）で開発している立場から見て、特に戸惑った・面白いと感じた違いをまとめます。

| 観点 | Vue.js（SPA） | Next.js（App Router） |
|---|---|---|
| コンポーネントの実行場所 | 常にブラウザ | **デフォルトはサーバー**。`"use client"` を書いたものだけブラウザでも実行 |
| データ取得 | `onMounted` + `fetch` や Pinia store、あるいは別途SSRフレームワーク（Nuxt）が必要 | Server Componentの中で直接 `await prisma.event.findMany()` のようにDBへアクセスできる |
| ルーティング | `vue-router` にルート定義を集約 | `app/events/[id]/page.tsx` のような**ファイル・ディレクトリ構造そのものがルーティング定義** |
| URLパラメータ | `route.params` で同期的に取得可能 | `params` / `searchParams` は **Promise** で、`await` が必須（ストリーミングを可能にするための設計） |
| リアクティブな状態 | `ref` / `reactive` + `watch` | `useState` + `useEffect`。「値が変わったら副作用を実行する」考え方は共通だが、依存配列を手動で書く必要がある |
| グローバルなインスタンス管理 | Piniaストアが暗黙的にシングルトン | `PrismaClient` を `globalThis` に自前で保存し、開発時のホットリロードで再生成されないようにする必要がある（[`src/lib/prisma.ts`](src/lib/prisma.ts)） |
| スタイル設定 | Tailwind v3までは `tailwind.config.js`（JS） | Tailwind v4は `globals.css` 内の `@theme` ディレクティブ（**CSSベース**）でトークンを定義 |
| APIとページの関係 | 別リポジトリ/別プロセスのAPI（Rails等）を`fetch` | Server Componentから直接DBを読み書きでき、`app/api/`（Route Handlers）は「外部公開用API」として別途用意する構成 |
| 単一ファイルコンポーネント | `.vue`（template / script / style が1ファイル） | `.tsx`（JSXとロジックが1ファイル、スタイルはTailwindのクラス名で表現） |

一番の感覚の違いは、**「このコンポーネントはどこで動くのか」を常に意識する必要がある**ことでした。
Vue.jsではコンポーネントはすべて等しく「ブラウザで動くもの」でしたが、Next.jsではServer Componentがデフォルトであり、
「本当にブラウザで動かす必要があるか？」を都度問い直す設計になっています。

## 今後の改善予定

- **DBレベルでの検索・絞り込み**: 現状は全件取得後にアプリケーション側でフィルタリングしています（SQLiteの `contains` が大文字小文字を区別する制約の回避も兼ねています）。データ量が増える場合はSQLクエリ側での絞り込み・ページネーションに切り替えます。
- **参加登録（RSVP）機能**: 現在 `participantCount` はシードデータ・手動更新のみで、来場者自身が「参加する」操作をするフローはまだありません。
- **募集状況の手動クローズUI**: `Event.status` を管理者が明示的に `CLOSED` にするための編集UIは未実装です（現状は定員到達による自動判定のみ）。
- **認可・認証**: 現状は誰でも登録・編集・削除が可能です。実運用ではDeviseやNextAuth等での認証・権限管理が必要になります。
- **PostgreSQLへの移行**: SQLite固有機能（enum非対応など）を避ける設計にしてあるため、`prisma/schema.prisma` の `datasource` と `@prisma/adapter-pg` への切り替えで移行できる想定です。
- **E2Eテストの追加**: Playwright等を用いた、実際のブラウザ操作を伴う登録〜削除までの一連のシナリオテスト。
- **ページネーション**: イベント件数が増えた場合の一覧表示の分割。

## スクリーンショット

<!--
実際に `npm run dev` で起動し、以下の画面のスクリーンショットをここに追加してください。
- トップページ
- イベント一覧（検索・絞り込み含む）
- イベント詳細
- イベント登録フォーム（バリデーションエラー表示時）
- モバイル表示
-->

| 画面 | スクリーンショット |
|---|---|
| トップページ | _(準備中)_ |
| イベント一覧 | _(準備中)_ |
| イベント詳細 | _(準備中)_ |
| イベント登録フォーム | _(準備中)_ |
