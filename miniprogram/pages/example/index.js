// pages/exampleDetail/index.js
Page({
  data: {
    type: "",
    envId: "",
    showTip: false,
    title: "",
    content: "",

    haveGetOpenId: false,
    openId: "",

    haveGetCodeSrc: false,
    codeSrc: "",

    haveGetRecord: false,
    record: [],

    haveGetImgSrc: false,
    imgSrc: "",

    // ai
    modelConfig: {
      modelProvider: "deepseek", // 澶фā鍨嬫湇鍔″巶鍟?      quickResponseModel: "deepseek-v3", // 蹇€熷搷搴旀ā鍨?锛堟贩鍏?turbo, gpt4 turbo鐗堬紝deepseek v3绛夛級
      logo: "https://cloudcache.tencent-cloud.com/qcloud/ui/static/static_source_business/2339414f-2c0d-4537-9618-1812bd14f4af.svg", // model 澶村儚
      welcomeMsg: "鎴戞槸deepseek-v3锛屽緢楂樺叴瑙佸埌浣狅紒", // model 娆㈣繋璇?    },
    callcbrCode: "",
    initEnvCode: "",
    callOpenIdCode: "",
    callMiniProgramCode: "",
    callFunctionCode: "",
    callCreateCollectionCode: "",
    callUploadFileCode: "",

    showInsertModal: false,
    insertRegion: "",
    insertCity: "",
    insertSales: "",

    haveGetCallContainerRes: false,
    callContainerResStr: "",

    ai_page_config: `{
  "usingComponents": {
    "agent-ui":"/components/agent-ui/index"
  },
}`,
    ai_wxml_config: `&lt;agent-ui agentConfig="{{agentConfig}}" showBotAvatar="{{showBotAvatar}}" chatMode="{{chatMode}}" modelConfig="{{modelConfig}}""&gt;&lt;/agent-ui&gt;`,
    ai_data_config: `data: {
  chatMode: "bot", // bot 琛ㄧず浣跨敤agent锛宮odel 琛ㄧず浣跨敤澶фā鍨?  showBotAvatar: true, // 鏄惁鍦ㄥ璇濇宸︿晶鏄剧ず澶村儚
  agentConfig: {
    botId: "your agent id", // agent id,
    allowWebSearch: true, // 鍏佽瀹㈡埛绔€夋嫨灞曠ず鑱旂綉鎼滅储鎸夐挳
    allowUploadFile: true, // 鍏佽瀹㈡埛绔睍绀轰笂浼犳枃浠舵寜閽?    allowPullRefresh: true, // 鍏佽瀹㈡埛绔睍绀轰笅鎷夊埛鏂?    allowUploadImage: true, // 鍏佽瀹㈡埛绔睍绀轰笂浼犲浘鐗囨寜閽?    allowMultiConversation: true, // 鍏佽瀹㈡埛绔睍绀烘煡鐪嬩細璇濆垪琛?鏂板缓浼氳瘽鎸夐挳
    showToolCallDetail: true, // 鏄惁灞曠ず mcp server toolCall 缁嗚妭
    allowVoice: true, // 鍏佽瀹㈡埛绔睍绀鸿闊虫寜閽?    showBotName: true, // 鍏佽灞曠ずbot鍚嶇О
  },
  modelConfig: {
    modelProvider: "hunyuan-open", // 澶фā鍨嬫湇鍔″巶鍟?    quickResponseModel: "hunyuan-lite", // 澶фā鍨嬪悕绉?    logo: "", // model 澶村儚
    welcomeMsg: "娆㈣繋璇?, // model 娆㈣繋璇?  },
}`,
  },

  onLoad(options) {
    console.log("options", options);
    if (
      options.type === "cloudbaserunfunction" ||
      options.type === "cloudbaserun"
    ) {
      this.getCallcbrCode();
    }
    if (options.type === "getOpenId") {
      this.getOpenIdCode();
    }
    if (options.type === "getMiniProgramCode") {
      this.getMiniProgramCode();
    }

    if (options.type === "createCollection") {
      this.getCreateCollectionCode();
    }

    if (options.type === "uploadFile") {
      this.getUploadFileCode();
    }
    this.setData({ type: options?.type, envId: options?.envId });
  },

  copyUrl() {
    wx.setClipboardData({
      data: "https://gitee.com/TencentCloudBase/cloudbase-agent-ui/tree/main/apps/miniprogram-agent-ui/miniprogram/components/agent-ui",
      success: function (res) {
        wx.showToast({
          title: "澶嶅埗鎴愬姛",
          icon: "success",
        });
      },
    });
  },

  insertRecord() {
    this.setData({
      showInsertModal: true,
      insertRegion: "",
      insertCity: "",
      insertSales: "",
    });
  },

  deleteRecord(e) {
    console.log("deleteRecord e", e);
    // 璋冪敤浜戝嚱鏁板垹闄よ褰?    wx.showLoading({
      title: "鍒犻櫎涓?..",
    });
    wx.cloud
      .callFunction({
        name: "quickstartFunctions",
        data: {
          type: "deleteRecord",
          data: {
            _id: e.currentTarget.dataset.id,
          },
        },
      })
      .then((resp) => {
        wx.showToast({
          title: "鍒犻櫎鎴愬姛",
        });
        this.getRecord(); // 鍒锋柊鍒楄〃
        wx.hideLoading();
      })
      .catch((e) => {
        wx.showToast({
          title: "鍒犻櫎澶辫触",
          icon: "none",
        });
        wx.hideLoading();
      });
    // const index = e.currentTarget.dataset.index;
    // const record = this.data.record;
    // record.splice(index, 1);
    // this.setData({
    //   record,
    // });
  },

  // 杈撳叆妗嗕簨浠?  onInsertRegionInput(e) {
    this.setData({ insertRegion: e.detail.value });
  },
  onInsertCityInput(e) {
    this.setData({ insertCity: e.detail.value });
  },
  onInsertSalesInput(e) {
    this.setData({ insertSales: e.detail.value });
  },
  // 鍙栨秷寮圭獥
  onInsertCancel() {
    this.setData({ showInsertModal: false });
  },

  // 纭鎻掑叆
  async onInsertConfirm() {
    const { insertRegion, insertCity, insertSales } = this.data;
    if (!insertRegion || !insertCity || !insertSales) {
      wx.showToast({ title: "璇峰～鍐欏畬鏁翠俊鎭?, icon: "none" });
      return;
    }
    wx.showLoading({ title: "鎻掑叆涓?.." });
    try {
      await wx.cloud.callFunction({
        name: "quickstartFunctions",
        data: {
          type: "insertRecord",
          data: {
            region: insertRegion,
            city: insertCity,
            sales: Number(insertSales),
          },
        },
      });
      wx.showToast({ title: "鎻掑叆鎴愬姛" });
      this.setData({ showInsertModal: false });
      this.getRecord(); // 鍒锋柊鍒楄〃
    } catch (e) {
      wx.showToast({ title: "鎻掑叆澶辫触", icon: "none" });
    } finally {
      wx.hideLoading();
    }
  },

  getOpenId() {
    wx.showLoading({
      title: "",
    });
    wx.cloud
      .callFunction({
        name: "quickstartFunctions",
        data: {
          type: "getOpenId",
        },
      })
      .then((resp) => {
        this.setData({
          haveGetOpenId: true,
          openId: resp.result.openid,
        });
        wx.hideLoading();
      })
      .catch((e) => {
        wx.hideLoading();
        const { errCode, errMsg } = e;
        if (errMsg.includes("Environment not found")) {
          this.setData({
            showTip: true,
            title: "浜戝紑鍙戠幆澧冩湭鎵惧埌",
            content:
              "濡傛灉宸茬粡寮€閫氫簯寮€鍙戯紝璇锋鏌ョ幆澧僆D涓?`miniprogram/app.js` 涓殑 `env` 鍙傛暟鏄惁涓€鑷淬€?,
          });
          return;
        }
        if (errMsg.includes("FunctionName parameter could not be found")) {
          this.setData({
            showTip: true,
            title: "璇蜂笂浼犱簯鍑芥暟",
            content:
              "鍦?cloudfunctions/quickstartFunctions'鐩綍鍙抽敭锛岄€夋嫨銆愪笂浼犲苟閮ㄧ讲-浜戠瀹夎渚濊禆銆戯紝绛夊緟浜戝嚱鏁颁笂浼犲畬鎴愬悗閲嶈瘯銆?,
          });
          return;
        }
      });
  },

  clearOpenId() {
    this.setData({
      haveGetOpenId: false,
      openId: "",
    });
  },

  clearCallContainerRes() {
    this.setData({
      haveGetCallContainerRes: false,
      callContainerResStr: "",
    });
  },

  getCodeSrc() {
    wx.showLoading({
      title: "",
    });
    wx.cloud
      .callFunction({
        name: "quickstartFunctions",
        data: {
          type: "getMiniProgramCode",
        },
      })
      .then((resp) => {
        this.setData({
          haveGetCodeSrc: true,
          codeSrc: resp.result,
        });
        wx.hideLoading();
      })
      .catch((e) => {
        wx.hideLoading();
        const { errCode, errMsg } = e;
        if (errMsg.includes("Environment not found")) {
          this.setData({
            showTip: true,
            title: "浜戝紑鍙戠幆澧冩湭鎵惧埌",
            content:
              "濡傛灉宸茬粡寮€閫氫簯寮€鍙戯紝璇锋鏌ョ幆澧僆D涓?`miniprogram/app.js` 涓殑 `env` 鍙傛暟鏄惁涓€鑷淬€?,
          });
          return;
        }
        if (errMsg.includes("FunctionName parameter could not be found")) {
          this.setData({
            showTip: true,
            title: "璇蜂笂浼犱簯鍑芥暟",
            content:
              "鍦?cloudfunctions/quickstartFunctions'鐩綍鍙抽敭锛岄€夋嫨銆愪笂浼犲苟閮ㄧ讲-浜戠瀹夎渚濊禆銆戯紝绛夊緟浜戝嚱鏁颁笂浼犲畬鎴愬悗閲嶈瘯銆?,
          });
          return;
        }
      });
  },

  clearCodeSrc() {
    this.setData({
      haveGetCodeSrc: false,
      codeSrc: "",
    });
  },

  bindInput(e) {
    const index = e.currentTarget.dataset.index;
    const record = this.data.record;
    record[index].sales = Number(e.detail.value);
    this.setData({
      record,
    });
  },

  getRecord() {
    wx.showLoading({
      title: "",
    });
    wx.cloud
      .callFunction({
        name: "quickstartFunctions",
        data: {
          type: "selectRecord",
        },
      })
      .then((resp) => {
        this.setData({
          haveGetRecord: true,
          record: resp.result.data,
        });
        wx.hideLoading();
      })
      .catch((e) => {
        this.setData({
          showTip: true,
        });
        wx.hideLoading();
      });
  },

  clearRecord() {
    this.setData({
      haveGetRecord: false,
      record: [],
    });
  },
  updateRecord() {
    wx.showLoading({
      title: "",
    });
    wx.cloud
      .callFunction({
        name: "quickstartFunctions",
        data: {
          type: "updateRecord",
          data: this.data.record,
        },
      })
      .then((resp) => {
        wx.showToast({
          title: "鏇存柊鎴愬姛",
        });
        wx.hideLoading();
      })
      .catch((e) => {
        console.log(e);
        this.setData({
          showUploadTip: true,
        });
        wx.hideLoading();
      });
  },

  uploadImg() {
    wx.showLoading({
      title: "",
    });
    // 璁╃敤鎴烽€夋嫨涓€寮犲浘鐗?    wx.chooseMedia({
      count: 1,
      success: (chooseResult) => {
        // 灏嗗浘鐗囦笂浼犺嚦浜戝瓨鍌ㄧ┖闂?        wx.cloud
          .uploadFile({
            // 鎸囧畾涓婁紶鍒扮殑浜戣矾寰?            cloudPath: `my-photo-${new Date().getTime()}.png`,
            // 鎸囧畾瑕佷笂浼犵殑鏂囦欢鐨勫皬绋嬪簭涓存椂鏂囦欢璺緞
            filePath: chooseResult.tempFiles[0].tempFilePath,
          })
          .then((res) => {
            console.log("upload res", res);
            this.setData({
              haveGetImgSrc: true,
              imgSrc: res.fileID,
            });
          })
          .catch((e) => {
            console.log("e", e);
          });
      },
      complete: () => {
        wx.hideLoading();
      },
    });
  },

  clearImgSrc() {
    this.setData({
      haveGetImgSrc: false,
      imgSrc: "",
    });
  },

  goOfficialWebsite() {
    const url = "https://docs.cloudbase.net/toolbox/quick-start";
    wx.navigateTo({
      url: `../web/index?url=${url}`,
    });
  },
  runCallContainer: async function () {
    const app = getApp();
    console.log("globalData", app.globalData);
    const c1 = new wx.cloud.Cloud({
      resourceEnv: app.globalData.env,
    });
    await c1.init();
    const r = await c1.callContainer({
      path: "/api/users", // 濉叆涓氬姟鑷畾涔夎矾寰?      header: {
        "X-WX-SERVICE": "express-test", // 濉叆鏈嶅姟鍚嶇О
      },
      // 鍏朵綑鍙傛暟鍚?wx.request
      method: "GET",
    });
    console.log(r);
    this.setData({
      haveGetCallContainerRes: true,
      callContainerResStr: `${JSON.stringify(r.data.items, null, 2)}`,
    });
  },
  getCallcbrCode: function () {
    const app = getApp();
    this.setData({
      callcbrCode: `const c1 = new wx.cloud.Cloud({
  resourceEnv: ${app.globalData.env}
})
await c1.init()
const r = await c1.callContainer({
  path: '/api/users', // 姝ゅ濉叆涓氬姟鑷畾涔夎矾寰勶紝 /api/users 涓虹ず渚嬭矾寰?  header: {
    'X-WX-SERVICE': 'express-test', // 濉叆涓氬姟鏈嶅姟鍚嶇О锛宔xpress-test 涓虹ず渚嬫湇鍔?  },
  // 鍏朵綑鍙傛暟鍚?wx.request
  method: 'GET',
})`,
    });
  },
  getInitEnvCode: function () {
    const app = getApp();
    this.setData({
      initEnvCode: `wx.cloud.init({
  env: ${app.globalData.env},
  traceUser: true,
});`,
    });
  },
  getCreateCollectionCode: function () {
    this.setData({
      callCreateCollectionCode: `const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
// 鍒涘缓闆嗗悎浜戝嚱鏁板叆鍙ｅ嚱鏁?exports.main = async (event, context) => {
  try {
    // 鍒涘缓闆嗗悎
    await db.createCollection('sales');
    return {
      success: true
    };
  } catch (e) {
    return {
      success: true,
      data: 'create collection success'
    };
  }
};`,
    });
  },
  getOpenIdCode: function () {
    this.setData({
      callOpenIdCode: `const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
// 鑾峰彇openId浜戝嚱鏁板叆鍙ｅ嚱鏁?exports.main = async (event, context) => {
  // 鑾峰彇鍩虹淇℃伅
  const wxContext = cloud.getWXContext();
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};`,
      callFunctionCode: `wx.cloud.callFunction({
  name: 'quickstartFunctions',
  data: {
    type: 'getOpenId'
  }
}).then((resp) => console.log(resp))`,
    });
  },
  getMiniProgramCode: function () {
    this.setData({
      callMiniProgramCode: `const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
// 鑾峰彇灏忕▼搴忎簩缁寸爜浜戝嚱鏁板叆鍙ｅ嚱鏁?exports.main = async (event, context) => {
  // 鑾峰彇灏忕▼搴忎簩缁寸爜鐨刡uffer
  const resp = await cloud.openapi.wxacode.get({
    path: 'pages/index/index'
  });
  const { buffer } = resp;
  // 灏嗗浘鐗囦笂浼犱簯瀛樺偍绌洪棿
  const upload = await cloud.uploadFile({
    cloudPath: 'code.png',
    fileContent: buffer
  });
  return upload.fileID;
};
`,
      callFunctionCode: `wx.cloud.callFunction({
  name: 'quickstartFunctions',
  data: {
    type: 'getMiniProgramCode'
  }
}).then((resp) => console.log(resp))`,
    });
  },
  getUploadFileCode: function () {
    this.setData({
      callUploadFileCode: `wx.chooseMedia({
count: 1,
success: (chooseResult) => {
  // 灏嗗浘鐗囦笂浼犺嚦浜戝瓨鍌ㄧ┖闂?  wx.cloud
    .uploadFile({
      // 鎸囧畾涓婁紶鍒扮殑浜戣矾寰?      cloudPath: "my-photo.png",
      // 鎸囧畾瑕佷笂浼犵殑鏂囦欢鐨勫皬绋嬪簭涓存椂鏂囦欢璺緞
      filePath: chooseResult.tempFiles[0].tempFilePath,
    })
    .then((res) => {
      console.log(res)
    })
    .catch((e) => {
      console.log('e', e)
    });
}
});`,
    });
  },
});
