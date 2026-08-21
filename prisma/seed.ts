// Development seed data. Run with `npm run db:seed` (wraps `prisma db seed`,
// which since Prisma v7 is never run automatically — see prisma.config.ts).
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { TECHNOLOGY_TAGS } from "../src/types/learning";

// Only check *that* the variable is set, never log its value.
if (!process.env.DIRECT_URL) {
  throw new Error("DIRECT_URL is not set");
}

// Seeding connects directly via the driver adapter + DIRECT_URL (a plain
// TCP connection string), not DATABASE_URL/Accelerate like the app's
// PrismaClient in src/lib/prisma.ts. Seeding is a one-off CLI operation
// (`npm run db:seed`), same as `prisma migrate`, so it uses the same direct
// connection those commands use rather than going through Accelerate.
const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL,
});
const prisma = new PrismaClient({ adapter });

// A fixed reference point so re-running the seed always produces the same
// "days from now" spread regardless of when it's run.
const now = new Date("2026-08-19T10:00:00+09:00");
const daysFromNow = (days: number, hour: number, minute = 0) => {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const events = [
  {
    title: "Ruby基礎もくもく会",
    description:
      "『たのしいRuby』を教材に、変数・条件分岐・配列・ハッシュなどの基礎文法を各自のペースで学ぶもくもく会です。詰まったところは他の参加者やメンターにいつでも質問できます。初めてプログラミングに触れる方も歓迎です。",
    date: daysFromNow(3, 19, 0),
    location: "オンライン（Discord）",
    capacity: 25,
    participantCount: 9,
    status: "RECRUITING",
    category: "Ruby",
    difficulty: "初心者",
    format: "オンライン",
    organizer: "Dev Learning Hub 運営",
    technologyTagNames: ["Ruby", "Git"],
  },
  {
    title: "Ruby on RailsでCRUDアプリを作ろう",
    description:
      "Ruby on Railsを使って、投稿の作成・一覧・編集・削除ができるシンプルなCRUDアプリをハンズオン形式で一緒に作ります。MVCの役割分担やActiveRecordの基本操作を、手を動かしながら理解することを目標にします。",
    date: daysFromNow(10, 13, 0),
    location: "渋谷 コワーキングスペースCode Base",
    capacity: 16,
    participantCount: 16,
    status: "RECRUITING",
    category: "Ruby on Rails",
    difficulty: "初級",
    format: "オフライン",
    organizer: "Rails勉強会運営チーム",
    technologyTagNames: ["Ruby on Rails", "Ruby", "データベース設計"],
  },
  {
    title: "AWSへWebアプリをデプロイする実践会",
    description:
      "EC2インスタンスの起動からセキュリティグループの設定、S3へのアセット配置までを実際の画面を見ながら一緒に進める実践会です。普段ローカル環境でしか動かしたことがない方の「初めての本番デプロイ」を後押しします。",
    date: daysFromNow(17, 14, 0),
    location: "オンライン（Zoom）",
    capacity: 20,
    participantCount: 11,
    status: "RECRUITING",
    category: "AWS",
    difficulty: "中級",
    format: "オンライン",
    organizer: "AWS学習コミュニティ",
    technologyTagNames: ["AWS", "EC2", "S3", "Docker"],
  },
  {
    title: "HTML・CSS・JavaScript基礎学習会",
    description:
      "Web制作の土台となるHTML・CSS・JavaScriptの基礎を、簡単なプロフィールページ作りを通して学びます。タグの意味、レイアウトの組み方、簡単なDOM操作までをカバーする、初めてWeb制作に触れる方向けの回です。",
    date: daysFromNow(6, 19, 30),
    location: "オンライン（Discord）",
    capacity: 30,
    participantCount: 14,
    status: "RECRUITING",
    category: "HTML・CSS",
    difficulty: "初心者",
    format: "オンライン",
    organizer: "Dev Learning Hub 運営",
    technologyTagNames: ["HTML", "CSS", "JavaScript"],
  },
  {
    title: "Vue.js・Reactフロントエンド交流会",
    description:
      "Vue.jsとReact、それぞれの経験者・学習者が集まり、コンポーネント設計や状態管理の考え方の違いについて情報交換する交流会です。特定の教材は使わず、参加者同士のディスカッション中心で進行します。",
    date: daysFromNow(24, 19, 0),
    location: "オンライン（Zoom）",
    capacity: 20,
    participantCount: 7,
    status: "RECRUITING",
    category: "Vue.js",
    difficulty: "レベル不問",
    format: "オンライン",
    organizer: "フロントエンド勉強会",
    technologyTagNames: ["Vue.js", "React", "JavaScript", "TypeScript"],
  },
  {
    title: "Next.js App Routerハンズオン",
    description:
      "Next.jsのApp Routerを使って、Server ComponentとClient Componentの使い分け、Route Handlers、データ取得の基本パターンを小さなアプリを作りながら学ぶハンズオンです。React経験者を対象としています。",
    date: daysFromNow(13, 13, 30),
    location: "オンライン（Zoom）",
    capacity: 18,
    participantCount: 5,
    status: "RECRUITING",
    category: "Next.js",
    difficulty: "中級",
    format: "オンライン",
    organizer: "Dev Learning Hub 運営",
    technologyTagNames: ["Next.js", "React", "TypeScript"],
  },
  {
    title: "Git・GitHub初心者勉強会",
    description:
      "add・commit・push・pull・branchといった基本コマンドの使い方から、GitHubでのPull Requestの出し方までを、実際に手を動かしながら学びます。エラーが出ても安心して質問できる初心者向けの回です。",
    date: daysFromNow(8, 20, 0),
    location: "オンライン（Discord）",
    capacity: 25,
    participantCount: 18,
    status: "RECRUITING",
    category: "Git・GitHub",
    difficulty: "初心者",
    format: "オンライン",
    organizer: "Dev Learning Hub 運営",
    technologyTagNames: ["Git", "GitHub"],
  },
  {
    title: "ポートフォリオ相談会",
    description:
      "転職・就職活動用のポートフォリオについて、構成や技術選定、README・READMEに書くべき内容などをメンターに個別相談できる会です。作成中のポートフォリオを画面共有しながらフィードバックを受けられます。",
    date: daysFromNow(45, 18, 0),
    location: "オンライン（Zoom）",
    capacity: 10,
    participantCount: 10,
    status: "CLOSED",
    category: "キャリア・ポートフォリオ",
    difficulty: "レベル不問",
    format: "オンライン",
    organizer: "キャリア支援チーム",
    technologyTagNames: ["ポートフォリオ", "キャリア相談", "GitHub"],
  },
];

const courses: {
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedHours: number;
  thumbnailTheme: string;
  lessons: { title: string; description: string; estimatedMinutes: number; isPreview: boolean }[];
}[] = [
  {
    title: "はじめてのRuby",
    slug: "intro-to-ruby",
    description:
      "プログラミングが初めての方向けに、Rubyの基本文法を1つずつ丁寧に学ぶ入門コースです。環境構築から、変数・条件分岐・繰り返し・配列・ハッシュの使い方までをカバーします。",
    category: "Ruby",
    difficulty: "初心者",
    estimatedHours: 8,
    thumbnailTheme: "indigo",
    lessons: [
      {
        title: "Rubyのインストールと環境構築",
        description: "rbenvを使ったRubyのインストールと、irbでの動作確認を行います。",
        estimatedMinutes: 25,
        isPreview: true,
      },
      {
        title: "変数と基本的なデータ型",
        description: "文字列・数値・真偽値の扱い方と、変数への代入を学びます。",
        estimatedMinutes: 35,
        isPreview: true,
      },
      {
        title: "条件分岐と繰り返し",
        description: "if/unless、each・timesなどの繰り返し処理を書けるようになります。",
        estimatedMinutes: 40,
        isPreview: false,
      },
      {
        title: "配列とハッシュ",
        description: "複数のデータをまとめて扱う配列・ハッシュの基本操作を学びます。",
        estimatedMinutes: 45,
        isPreview: false,
      },
      {
        title: "メソッドの定義",
        description: "自分でメソッドを定義し、引数・戻り値の考え方を理解します。",
        estimatedMinutes: 35,
        isPreview: false,
      },
    ],
  },
  {
    title: "Ruby on RailsでWebアプリ開発",
    slug: "rails-web-app-development",
    description:
      "Ruby on Railsの基本を学びながら、投稿機能を持つ簡単なWebアプリケーションを開発するコースです。MVCの考え方とActiveRecordによるデータベース操作を中心に扱います。",
    category: "Ruby on Rails",
    difficulty: "初級",
    estimatedHours: 12,
    thumbnailTheme: "indigo",
    lessons: [
      {
        title: "Railsアプリケーションの作成",
        description: "rails newから、ディレクトリ構成とMVCの役割を理解します。",
        estimatedMinutes: 30,
        isPreview: true,
      },
      {
        title: "ルーティングとコントローラ",
        description: "config/routes.rbの書き方と、コントローラ・アクションの対応を学びます。",
        estimatedMinutes: 40,
        isPreview: false,
      },
      {
        title: "ActiveRecordでモデルを作る",
        description: "マイグレーションでテーブルを作成し、ActiveRecordの基本操作を学びます。",
        estimatedMinutes: 50,
        isPreview: false,
      },
      {
        title: "投稿のCRUD機能を実装する",
        description: "一覧・詳細・新規作成・編集・削除の一連の機能を実装します。",
        estimatedMinutes: 60,
        isPreview: false,
      },
    ],
  },
  {
    title: "HTML・CSS基礎",
    slug: "html-css-basics",
    description:
      "Webページの骨組みを作るHTMLと、見た目を整えるCSSの基礎を学ぶコースです。よく使うタグとFlexboxを使ったレイアウトの組み方を、実際にページを作りながら習得します。",
    category: "HTML・CSS",
    difficulty: "初心者",
    estimatedHours: 6,
    thumbnailTheme: "cyan",
    lessons: [
      {
        title: "HTMLの基本構造とよく使うタグ",
        description: "見出し・段落・リンク・画像など、基本的なタグの使い方を学びます。",
        estimatedMinutes: 30,
        isPreview: true,
      },
      {
        title: "CSSの基本とセレクタ",
        description: "色・フォント・余白の指定方法と、CSSセレクタの基礎を学びます。",
        estimatedMinutes: 30,
        isPreview: true,
      },
      {
        title: "Flexboxでレイアウトを組む",
        description: "Flexboxを使って、要素を横並び・中央揃えに配置する方法を学びます。",
        estimatedMinutes: 40,
        isPreview: false,
      },
      {
        title: "レスポンシブ対応の基本",
        description: "メディアクエリを使い、スマートフォン表示にも対応させます。",
        estimatedMinutes: 35,
        isPreview: false,
      },
    ],
  },
  {
    title: "JavaScript・TypeScript入門",
    slug: "javascript-typescript-intro",
    description:
      "JavaScriptの基本文法とDOM操作を学んだあと、型安全にコードを書けるTypeScriptの基礎へとステップアップするコースです。",
    category: "JavaScript",
    difficulty: "初級",
    estimatedHours: 9,
    thumbnailTheme: "amber",
    lessons: [
      {
        title: "JavaScriptの基本文法",
        description: "変数宣言・関数・配列操作など、JavaScriptの基礎を学びます。",
        estimatedMinutes: 35,
        isPreview: true,
      },
      {
        title: "DOM操作とイベント処理",
        description: "要素の取得・書き換えと、クリックイベントなどの基本を学びます。",
        estimatedMinutes: 40,
        isPreview: false,
      },
      {
        title: "非同期処理の基礎（Promise/async-await）",
        description: "fetchを使ったAPI通信を例に、非同期処理の書き方を学びます。",
        estimatedMinutes: 45,
        isPreview: false,
      },
      {
        title: "TypeScriptの基本的な型",
        description: "string・number・配列・オブジェクトの型注釈の書き方を学びます。",
        estimatedMinutes: 35,
        isPreview: false,
      },
      {
        title: "interfaceとunion型",
        description: "オブジェクトの形を定義するinterfaceと、union型の使い方を学びます。",
        estimatedMinutes: 35,
        isPreview: false,
      },
    ],
  },
  {
    title: "Vue.jsから学ぶReact入門",
    slug: "from-vue-to-react",
    description:
      "Vue.jsの経験がある方を対象に、考え方の対応関係を示しながらReactの基礎（コンポーネント・props・state・useEffect）を学ぶコースです。",
    category: "React",
    difficulty: "中級",
    estimatedHours: 7,
    thumbnailTheme: "cyan",
    lessons: [
      {
        title: "コンポーネントとJSXの書き方",
        description: "Vueの<template>とJSXの違いを対比しながら理解します。",
        estimatedMinutes: 30,
        isPreview: true,
      },
      {
        title: "propsとuseState",
        description: "Vueのprops/refに相当する、Reactのprops・useStateを学びます。",
        estimatedMinutes: 40,
        isPreview: false,
      },
      {
        title: "useEffectとライフサイクル",
        description: "Vueのwatch/onMountedに相当するuseEffectの使い方を学びます。",
        estimatedMinutes: 40,
        isPreview: false,
      },
      {
        title: "リストレンダリングと条件分岐",
        description: "v-for/v-ifに相当する、mapや条件式でのレンダリングを学びます。",
        estimatedMinutes: 30,
        isPreview: false,
      },
    ],
  },
  {
    title: "Next.js App Router入門",
    slug: "nextjs-app-router-intro",
    description:
      "React経験者向けに、Next.jsのApp RouterにおけるServer Component・Client Component・Route Handlersの基本的な使い分けを学ぶコースです。",
    category: "Next.js",
    difficulty: "中級",
    estimatedHours: 8,
    thumbnailTheme: "indigo",
    lessons: [
      {
        title: "App Routerのファイル構成",
        description: "page.tsx・layout.tsxなど、ディレクトリ構造がルーティングになる仕組みを学びます。",
        estimatedMinutes: 30,
        isPreview: true,
      },
      {
        title: "Server ComponentとClient Component",
        description: "デフォルトのServer Componentと、\"use client\"の使いどころを学びます。",
        estimatedMinutes: 40,
        isPreview: false,
      },
      {
        title: "データ取得の基本パターン",
        description: "Server Componentから直接データベース・APIへアクセスする方法を学びます。",
        estimatedMinutes: 40,
        isPreview: false,
      },
      {
        title: "Route Handlersの作成",
        description: "app/api配下にGET/POSTなどのAPIエンドポイントを実装します。",
        estimatedMinutes: 35,
        isPreview: false,
      },
    ],
  },
  {
    title: "AWSデプロイ実践",
    slug: "aws-deploy-practice",
    description:
      "作成したWebアプリケーションを実際にAWS上へデプロイするコースです。EC2の起動からセキュリティグループの設定、S3の活用までを実践形式で学びます。",
    category: "AWS",
    difficulty: "中級",
    estimatedHours: 6,
    thumbnailTheme: "violet",
    lessons: [
      {
        title: "AWSアカウントとIAMの基本",
        description: "安全なAWS利用のためのIAMユーザー・権限の基本を学びます。",
        estimatedMinutes: 25,
        isPreview: true,
      },
      {
        title: "EC2インスタンスの起動",
        description: "EC2インスタンスを起動し、SSH接続できるようにします。",
        estimatedMinutes: 35,
        isPreview: false,
      },
      {
        title: "セキュリティグループの設定",
        description: "必要なポートだけを開放する、安全なネットワーク設定を学びます。",
        estimatedMinutes: 25,
        isPreview: false,
      },
      {
        title: "S3への静的ファイル配置",
        description: "S3バケットを作成し、画像などの静的アセットを配置します。",
        estimatedMinutes: 30,
        isPreview: false,
      },
    ],
  },
  {
    title: "Git・GitHub入門",
    slug: "git-github-intro",
    description:
      "バージョン管理システムGitの基本操作と、GitHubを使ったチーム開発の基礎（Pull Request・レビュー）を学ぶコースです。",
    category: "Git・GitHub",
    difficulty: "初心者",
    estimatedHours: 4,
    thumbnailTheme: "emerald",
    lessons: [
      {
        title: "Gitの基本操作（add/commit）",
        description: "git init・add・commitの流れと、コミットメッセージの書き方を学びます。",
        estimatedMinutes: 25,
        isPreview: true,
      },
      {
        title: "ブランチとマージ",
        description: "branch・checkout・mergeを使った、変更の分岐と統合を学びます。",
        estimatedMinutes: 30,
        isPreview: true,
      },
      {
        title: "GitHubへのpushとPull Request",
        description: "リモートリポジトリへのpushと、Pull Requestの作成方法を学びます。",
        estimatedMinutes: 30,
        isPreview: false,
      },
    ],
  },
];

async function main() {
  console.log(`Seeding ${TECHNOLOGY_TAGS.length} technology tags...`);
  // `upsert` (not `deleteMany` + `create`) for tags specifically: events
  // below `connect` to these by name, so the tag rows need to exist
  // first, and upserting keeps re-seeding safe even if a tag is already
  // referenced by an event created outside this script.
  for (const name of TECHNOLOGY_TAGS) {
    await prisma.technologyTag.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log(`Seeding ${events.length} learning events...`);
  // `deleteMany` + `create` keeps the seed idempotent and simple to reason
  // about for a small demo dataset — Prisma has no bulk "upsert by title"
  // helper, so re-seeding is treated as "reset the demo data" rather than
  // trying to diff it. Not a pattern to reach for on a real user table.
  await prisma.event.deleteMany();
  for (const { technologyTagNames, ...event } of events) {
    await prisma.event.create({
      data: { ...event, technologyTags: { connect: technologyTagNames.map((name) => ({ name })) } },
    });
  }

  console.log(`Seeding ${courses.length} courses...`);
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  for (const { lessons, ...course } of courses) {
    await prisma.course.create({
      data: {
        ...course,
        lessons: {
          create: lessons.map((lesson, index) => ({ ...lesson, position: index + 1 })),
        },
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
