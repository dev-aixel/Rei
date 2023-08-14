const { SlashCommandBuilder } = require('@discordjs/builders');
const { exec } = require('child_process');
const iconv = require('iconv-lite');
const dotenv = require('dotenv');

// .env ファイルから環境変数を読み込む
dotenv.config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('console')
    .setDescription('コンソールコマンドを実行して結果を表示します。')
    .addStringOption(option =>
      option
        .setName('command')
        .setDescription('実行するコマンドを入力してください。')
        .setRequired(true)
    ),

  async execute(interaction) {
    const allowedUser = process.env.USER_ID;

    // 許可されたユーザー以外の場合は終了するようにする
    if (interaction.user.id !== allowedUser) {
      await interaction.reply({ content: 'このコマンドは許可されていません。', ephemeral: true });
      return;
    }

    // コマンドの取得
    const command = interaction.options.getString('command');

    // コマンドの実行
    interaction.deferReply({ ephemeral: true });
    exec(command, { encoding: 'buffer' }, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        interaction.editReply({ content: 'コマンドの実行中にエラーが発生しました。', ephemeral: true });
      } else {
        const result = iconv.decode(stdout, 'Shift_JIS'); // Shift JISからUTF-8に変換
        interaction.editReply({ content: `\`\`\`\n${result}\n\`\`\``, ephemeral: true });
      }
    });
  },
};

// Copyright © 2014-2023 @dev_aixel All Rights Reserved.