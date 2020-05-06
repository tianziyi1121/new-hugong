const app = getApp();
const api = require('../../../utils/api.js')
const toolTip = require('../../../utils/toolTip.js')
const common = require('../../../utils/common.js')
const agoraMiniappSDK = require('../../../utils/Agora_Miniapp_SDK_for_WeChat.js');
const aPPID = 'f11b36cc2d0c4866bf1920db4f4d1c1d'
Page({
  data: {
    height: null,
    url: null,
    playUrl: null,
    media: [],
    muted: false,
  },
  onLoad: function (options) {
    this.channel = options.channel || '20';// channel 房间号
    this.role = "broadcaster"; // role:是否推流
    this.uid = app.globalData.uid || 1 // 用户唯一标识
    this.leaving = false; // 防止用户而点击过快离开
    // 保持页面长亮
    wx.setKeepScreenOn({
      keepScreenOn: true
    });
  },
  onReady: function () {
    // 推流上下文
    this.ctx = wx.createLivePusherContext("pusher");
    //  拉流上下文
    this.liveP = wx.createLivePlayerContext('player');
    let uid = this.uid
    let channel = this.channel
    this.initAgoraChannel(uid, channel).then(url => {
      let ts = new Date().getTime();
      this.addMedia(0, this.uid, url, {
        key: ts
      });
    }).catch(e => {
      wx.showToast({
        title: `客户端初始化失败`,
        icon: 'none',
        duration: 5000
      });
    });
  },
  onShow: function () {

  },
  // 状态变化事件
  recorderStateChange (e) {
    console.log(e)
  },
  // pusher 的网络状况
  recorderNetChange (e) {
    
  },
  // player 播放状态变化事件
  playerStateChange (e) {
    if (e.detail.code === 2004) {
      if (this.data.status === "loading") {
        console.log("成功")
      }
    } else if (e.detail.code === -2301) {
      console.log("失败")
    }
  },
  // 初始化sdk推流
  initAgoraChannel (uid, channel) {
    return new Promise((resolve, reject) => {
      let client = {}
      client = new agoraMiniappSDK.Client()
      // 订阅流事件
      this.subscribeEvents(client);
      // agoraMiniappSDK.LOG.setLogLevel(-1);
      this.client = client;
      // client.setRole(this.role);
      
      client.init(aPPID, () => {
        // pass key instead of undefined if certificate is enabled
        // 如果启用证书，则传递密钥而不是未定义
        client.join('006f11b36cc2d0c4866bf1920db4f4d1c1dIADCihlc3ze1j7owyXGXJKGk32AUT3Y4CdYyIqil0eFOiSJ2cIoAAAAAEABXPAJx2HqFXgEAAQC0eoVe', channel, uid, () => {
          // and get my stream publish url
          // 获取我的流发布url
          client.publish(url => {
            resolve(url);
          }, e => {
            reject(e)
          });
        }, e => {
          reject(e)
        })
      }, e => {
        reject(e);
      });
    });
  },
  addMedia(mediaType, uid, url, options) {
    let media = this.data.media || [];
    if (mediaType === 0) {
      //pusher
      media.splice(0, 0, {
        key: options.key,
        type: mediaType,
        uid: `${uid}`,
        url: url,
        name: 'pusher'
      });
    } else {
      //player
      media.push({
        key: options.key,
        rotation: options.rotation,
        type: mediaType,
        uid: `${uid}`,
        url: url,
        name: 'player'
      });
    }
    console.log(this.data.media)
    this.setData({
      media: media
    })
  },
  /**
   * reconnect when bad things happens... 当不好的事情发生时，重新联系
   */
  reconnect: function () {
    wx.showToast({
      title: `尝试恢复链接...`,
      icon: 'none',
      duration: 5000
    });
    // always destroy client first *important* miniapp supports 2 websockets maximum at same time do remember to destroy old client first before creating new ones
    //  总是先摧毁客户端miniapp同时支持2个websockets，在创建新客户端之前一定要先销毁旧客户端
    this.client && this.client.destroy();
    this.reconnectTimer = setTimeout(() => {
      let uid = this.uid;
      let channel = this.channel;
      this.reinitAgoraChannel(uid, channel).then(url => {
        // Utils.log(`channel: ${channel}, uid: ${uid}`);
        // Utils.log(`pushing ${url}`);
        let ts = new Date().getTime();

        if (this.isBroadcaster()) {
          if (this.hasMedia(0, this.uid)) {
            // pusher already exists in media list 已经存在于媒体列表中
            this.updateMedia(this.uid, {
              url: url,
              key: ts,
            });
          } else {
            // pusher not exists in media list 媒体列表中不存在推送器
            // Utils.log(`pusher not yet exists when rejoin...adding`);//  添加时，推送器还不存在
            this.addMedia(0, this.uid, url, {
              key: ts
            });
          }
        }
      }).catch(e => {
        // Utils.log(`reconnect failed: ${e}`);
        return this.reconnect();
      });
    }, 1 * 1000);
  },
  /**
 * 注册stream事件
 */
  subscribeEvents: function (client) {
    /** fired when new stream join the channel 当新的流加入通道时触发 */
    client.on("stream-added", e => {
      let uid = e.uid;
      const ts = new Date().getTime();
      /** subscribe to get corresponding url 订阅以获得相应的url */
      client.subscribe(uid, (url, rotation) => {
        
        let media = this.data.media || [];
        let matchItem = null;
        for (let i = 0; i < media.length; i++) {
          let item = this.data.media[i];
          if (`${item.uid}` === `${uid}`) {
            //if existing, record this as matchItem and break 如果存在，将其记录为匹配项并断开
            matchItem = item;
            break;
          }
        }
        if (!matchItem) {
          //if not existing, add new media  如果不存在，则添加新媒体
          this.addMedia(1, uid, url, {
            key: ts,
            rotation: rotation
          })
        } else {
          // if existing, update property change key property to refresh live-player  如果存在，则更新属性将密钥属性更改为refresh
          this.updateMedia(matchItem.uid, {
            url: url,
            key: ts,
          });
        }
      }, e => {

      });
    });
    /** remove stream when it leaves the channel 当流离开通道时将其移除 */
    client.on("stream-removed", e => {
      let uid = e.uid;
      this.removeMedia(uid);
    });
    /** when bad thing happens - we recommend you to do a full reconnect when meeting such error it's also recommended to wait for few seconds before reconnect attempt */
    // 当坏的事情发生-我们建议你做一个完整的重新连接时，遇到这样的错误，也建议等待几秒钟前重新连接的尝试
    client.on("error", err => {
      let errObj = err || {};
      let code = errObj.code || 0;
      let reason = errObj.reason || ""; 
      let ts = new Date().getTime();
      if (code === 501 || code === 904) {
        this.reconnect();
      } 
    });
    /** there are cases when server require you to update player url, when receiving such event, update url into corresponding live-player, REMEMBER to update key property so that live-player is properly refreshed NOTE you can ignore such event if it's for pusher or happens before stream-added */
    // 有服务器要求你更新播放器url的情况，当收到这样的事件时，将url更新到相应的live-player中，记住要更新密钥属性，以便live-player被正确刷新
    client.on('update-url', e => {
      let uid = e.uid;
      let url = e.url;
      let ts = new Date().getTime();
      if (`${uid}` === `${this.uid}`) {
        // if it's not pusher url, update    如果不是pusher url，请更新
      } else {
        this.updateMedia(uid, {
          url: url,
          key: ts,
        });
      }
    });
  },
  /** remove media from view 从视图中删除媒体 （完）*/
  removeMedia (uid) {
    let media = this.data.media || [];
    media = media.filter(item => {
      return `${item.uid}` !== `${uid}`
    });
    if (media.length === this.data.media.length) {
      // 调整布局
      // media = this.syncLayout(media);
      // this.refreshMedia(media);
    } else {
      return Promise.resolve();
    }
  },


  // update media object the media component will be fully refreshed if you try to update key property.(完)
  // 如果试图更新密钥属性，则媒体组件将被完全刷新。
  updateMedia: function (uid, options) {
    let media = this.data.media || [];
    let changed = false;
    for (let i = 0; i < media.length; i++) {
      let item = media[i];
      if (`${item.uid}` === `${uid}`) {
        media[i] = Object.assign(item, options);
        changed = true;
        break;
      }
    }
    if (changed) {
      // return this.refreshMedia(media);
      this.setData({
        media: media
      })
    } else {
      return Promise.resolve();
    }
  },
})