Component({
  /** 组件的属性列表 */
  properties: {
    url: {
      type: String,
      value: ""
    }
  },
  /** 组件的初始数据 */
  data: {
    playContext: null,
    detached: false,
    orientation: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /** start live player via context in most cases you should not call this manually in your page as this will be automatically called in component ready method */
    // 通过上下文启动live player在大多数情况下，你不应该在你的页面中手动调用它，因为它会在组件就绪方法中被自动调用
    start: function () {
      const uid = this.data.uid;
      if (this.data.status === "ok") {
        return;
      }
      if (this.data.detached) {
        // try to start pusher while component already detached 当组件已经脱离时，试着启动pusher
        return;
      }
      this.data.playContext.play();
    },

    /** stop live pusher context 停止实时推送上下文*/
    stop: function () {
      const uid = this.data.uid;
      this.data.playContext.stop();
    },

    /** rotate video by rotation 视频旋转*/
    rotate: function (rotation) {
      let orientation = rotation === 90 || rotation === 270 ? "horizontal" : "vertical";
      this.setData({
        orientation: orientation
      });
    },

    /** 播放器状态更新回调 */
    playerStateChange: function (e) {
      let uid = parseInt(e.target.id.split("-")[1]);
      if (e.detail.code === 2004) {
        if (this.data.status === "loading") {
          this.setData({
            status: "ok"
          });
        }
      } else if (e.detail.code === -2301) {
        this.setData({
          status: "error"
        })
      }
    },
  },
  /** 组件生命周期 */
  ready: function () {
    this.data.playContext || (this.data.playContext = wx.createLivePlayerContext(`player`, this));
    // if we already have url when component mounted, start directly 如果我们已经有url时，组件挂载，直接开始
    console.log("===============================================+++++++++++++++++++++++++++++++++++++++++++++++++++++")
    if (this.data.url) {
      console.log("1212121212121212121212121212122121221212121212")
      this.start();
    }
  },
  moved: function () {
    
  },
  detached: function () {
    // auto stop player when detached  自动停止播放器时分离
    this.data.playContext && this.data.playContext.stop();
    this.data.detached = true;
  }
})
