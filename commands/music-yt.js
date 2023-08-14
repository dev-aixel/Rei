const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// .envファイルからYouTube APIキーを取得
const apiKey = process.env.YOUTUBE_API_KEY;

const dbPath = './db/musicyt.db';

// SQLiteデータベースファイルが存在しない場合は、新しく作成する
if (!fs.existsSync(dbPath)) {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error creating database:', err);
    } else {
      console.log('Database created successfully.');

      // テーブルを作成する
      db.run(`
        CREATE TABLE IF NOT EXISTS videos (
          id INTEGER PRIMARY KEY,
          videoId TEXT NOT NULL,
          videoUrl TEXT NOT NULL
        )
      `, (err) => {
        if (err) {
          console.error('Error creating table:', err);
        } else {
          console.log('Table created successfully.');

          // データベースを閉じる
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err);
            } else {
              console.log('Database closed.');
            }
          });
        }
      });
    }
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('musicyt')
    .setDescription('ランダムな音楽リンクを出力します。'),

  async execute(interaction) {
    try {
      // データベースを開く
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
        } else {
          console.log('Database opened successfully.');

          // データベースから動画リンクを取得
          db.all('SELECT videoUrl FROM videos', (err, rows) => {
            if (err) {
              console.error('Error querying database:', err);
              interaction.reply('データベースの検索中にエラーが発生しました。');
            } else {
              if (rows.length === 0) {
                // データベースが空ならAPIリクエストを行う
                this.fetchAndReplyRandomVideo(interaction, db);
              } else {
                // データベースからランダムな動画リンクを取得して出力
                const selectedVideoUrl = rows[Math.floor(Math.random() * rows.length)].videoUrl;
                interaction.reply(`ランダムな音楽をお楽しみください！\n${selectedVideoUrl}\nいい一日を！`);
              }
            }
          });
        }
      });
    } catch (error) {
      console.error(error);
      await interaction.reply('音楽リンクを取得できませんでした。後でもう一度お試しください。');
    }
  },

  async fetchAndReplyRandomVideo(interaction, db) {
    try {
      // YouTube APIにリクエストしてランダムな音楽を取得
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          key: apiKey,
          part: 'snippet',
          q: '音楽',
          type: 'video',
          maxResults: 300,
        },
      });

      const videoIds = response.data.items.map(item => item.id.videoId);

      if (videoIds.length === 0) {
        throw new Error('No videos found.');
      }

      // 取得した300件の動画リンクをDBに保存
      db.serialize(() => {
        db.run('DELETE FROM videos');
        const stmt = db.prepare('INSERT INTO videos (videoId, videoUrl) VALUES (?, ?)');
        videoIds.forEach(videoId => {
          const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
          stmt.run(videoId, videoUrl);
        });
        stmt.finalize();

        console.log('Videos saved to database.');

        // ランダムに選別して動画リンクを取得
        const selectedVideoUrl = videoIds[Math.floor(Math.random() * videoIds.length)];

        // テキストで音楽リンクを出力
        interaction.reply(`ランダムな音楽をお楽しみください！\n${selectedVideoUrl}\nいい一日を！`);
      });
    } catch (error) {
      console.error(error);
      await interaction.reply('音楽リンクを取得できませんでした。後でもう一度お試しください。');
    }
  },
};
// Copyright © 2014-2023 @dev_aixel All Rights Reserved.