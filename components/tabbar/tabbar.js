Component({
  data: {
    tabbarList: [
      {
        pagePath: "/pages/home/index/index",
        text: "历史记录",
        iconPath: "/static/history.png",
        selectedIconPath: "/static/history-black.png"
      },
      {
        pagePath: "/pages/shopping/newproducts/index",
        text: "历史记录",
        iconPath: "/static/history.png",
        selectedIconPath: "/static/history-black.png"
      },
      {
        pagePath: "/pages/live/index/index",
        text: "历史记录",
        iconPath: "/static/history.png",
        selectedIconPath: "/static/history-black.png"
      }
    ],
    ids: 0
  },
  attached () {

  },
  methods: {
    catchNav (e) {
      let url = e.currentTarget.dataset.url
      this.triggerEvent('onCatchNav', {
        url: url
      });
    }
  }
})