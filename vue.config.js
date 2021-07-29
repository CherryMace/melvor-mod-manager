module.exports = {
  pluginOptions: {
    electronBuilder: {
      preload: "src/preload.js",
      builderOptions: {
        appId: "com.cherrymace.m3",
        productName: "Melvor Mod Manager",
        copyright: "Copyright © 2021 ${author}",
        icon: "build/m3-icon.png",
        publish: ['github']
      }
    },
  },
  transpileDependencies: [
    'vuetify'
  ]
};
