const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

const defaultAccessToken = process.env.DEFAULT_ACCESS_TOKEN;
const instance = process.env.MISSKEY_INSTANCE_URL;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('misskey-message')
    .setDescription('Misskeyに投稿します。')
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('投稿する文章を入力してください。')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('access-token')
        .setDescription('Misskeyのアクセストークンを指定してください。')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    const message = interaction.options.getString('message');
    const accessToken = interaction.options.getString('accessToken') || defaultAccessToken;
    const instance = 'https://xisskey.net'; // MisskeyインスタンスのURL

    // Misskeyへの投稿リクエスト
    try {
      const response = await axios.post(`${instance}/api/notes/create`, {
        text: message,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      // 成功した場合の処理
      console.log(response.data);
      interaction.reply({ content: 'Misskeyに投稿しました。', ephemeral: true });
    } catch (error) {
      // エラーが発生した場合の処理
      console.error('Misskeyへの投稿中にエラーが発生しました。', error);
      interaction.reply({ content: 'Misskeyへの投稿中にエラーが発生しました。', ephemeral: true });
    }
  },
};
// Copyright © 2014-2023 @dev_aixel All Rights Reserved.