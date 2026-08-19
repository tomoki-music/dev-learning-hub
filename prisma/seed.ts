// Development seed data. Run with `npm run db:seed` (wraps `prisma db seed`,
// which since Prisma v7 is never run automatically — see prisma.config.ts).
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
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
    title: "秋の弾き語りナイト",
    description:
      "アコースティック限定のオープンマイクイベントです。初めての方も大歓迎。1人3曲までの持ち時間で、弾き語り・アコギ演奏をお楽しみください。",
    date: daysFromNow(14, 19, 0),
    location: "下北沢 Live House Moon",
    capacity: 20,
    participantCount: 8,
    status: "RECRUITING",
  },
  {
    title: "バンドアンサンブル体験ワークショップ",
    description:
      "楽器経験1年以上を対象に、初対面のメンバーでその場でバンドを組み、3時間でセッションを組み上げるワークショップです。ドラム・ベース・ギター・キーボード・ボーカル募集。",
    date: daysFromNow(21, 13, 30),
    location: "渋谷 サウンドスタジオNOA 渋谷店",
    capacity: 15,
    participantCount: 15,
    status: "RECRUITING",
  },
  {
    title: "歌声診断オフラインミートアップ",
    description:
      "オンラインで交流しているメンバー同士のリアル交流会です。歌声診断の結果を持ち寄って、パート適性やボイストレーニングの工夫を語り合います。",
    date: daysFromNow(5, 18, 0),
    location: "新宿区 コミュニティスペースHarmony",
    capacity: 30,
    participantCount: 12,
    status: "RECRUITING",
  },
  {
    title: "初心者歓迎！ウクレレサークル体験会",
    description:
      "ウクレレを触ったことがない方向けの体験会です。楽器の貸し出しもあります。基本コードを覚えて、最後はみんなで簡単な曲を合奏します。",
    date: daysFromNow(9, 11, 0),
    location: "吉祥寺 音楽サロンLani",
    capacity: 12,
    participantCount: 12,
    status: "CLOSED",
  },
  {
    title: "作詞作曲もくもく会",
    description:
      "各自パソコンや楽器を持ち寄り、黙々と制作を進める会です。1時間ごとに進捗共有タイムがあり、行き詰まったときはお互いにフィードバックし合えます。",
    date: daysFromNow(3, 14, 0),
    location: "オンライン（Discord）",
    capacity: 25,
    participantCount: 6,
    status: "RECRUITING",
  },
  {
    title: "冬の合同ライブ 出演者募集",
    description:
      "年に一度の合同ライブイベントです。ジャンル不問、1組20分の持ち時間で出演していただけます。機材の詳細は決定後に個別連絡します。",
    date: daysFromNow(60, 17, 0),
    location: "池袋 LIVE HALL Prism",
    capacity: 10,
    participantCount: 3,
    status: "CLOSED",
  },
];

async function main() {
  console.log(`Seeding ${events.length} events...`);

  // `deleteMany` + `create` keeps the seed idempotent and simple to reason
  // about for a small demo dataset — Prisma has no bulk "upsert by title"
  // helper, so re-seeding is treated as "reset the demo data" rather than
  // trying to diff it. Not a pattern to reach for on a real user table.
  await prisma.event.deleteMany();

  for (const event of events) {
    await prisma.event.create({ data: event });
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
