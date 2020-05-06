Component({
  /**
   * 组件的属性列表
   */
  properties: {
    url: {
      type: String,
      value: ""
    },
    muted: {
      type: String,
      value: ""
    }
  },

  /** 组件的初始数据*/
  data: {
    pusherContext: null,
    detached: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /** start live pusher via context in most cases you should not call this manually in your page as this will be automatically called in component ready method */
    // 通过上下文启动live pusher在大多数情况下，你不应该在你的页面中手动调用这个，因为它会在组件就绪方法中自动调用
    start() {
      this.data.pusherContext.stop();
      if (this.data.detached) {
        return;
      }
      this.data.pusherContext.start();
    },

    // stop live pusher context   停止实时推送上下文
    stop() {
      this.data.pusherContext.stop();
    },

    /** switch camera direction 切换镜头的方向 */
    switchCamera() {
      this.data.pusherContext.switchCamera();
    },

    /** 推流状态更新回调 */
    recorderStateChange: function (e) {
      if (e.detail.code === -1307) {
        //re-push
        this.setData({
          status: "error"
        })
        //emit event
        this.triggerEvent('pushfailed');
      }

      if (e.detail.code === 1008) {
        //started
        if (this.data.status === "loading") {
          this.setData({
            status: "ok"
          })
        }
      }
    },
    recorderNetChange: function (e) {
      // Utils.log(`network: ${JSON.stringify(e.detail)}`);
    }
  },

  /**
   * 组件生命周期
   */
  ready: function () {
    this.data.pusherContext || (this.data.pusherContext = wx.createLivePusherContext(this));
  },
  moved: function () {
  },
  detached: function () {
    // auto stop pusher when detached  分离时自动停止推送
    this.data.pusherContext && this.data.pusherContext.stop();
    this.data.detached = true;
  }
})
