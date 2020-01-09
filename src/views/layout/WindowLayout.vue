<template>
  <div class="window-area">
    <div v-if="!noHaveDrag" class="top-drag" style="-webkit-app-region: drag">
      <div class="top-no-drag" style="-webkit-app-region: no-drag"></div>
      <div class="left-no-drag" style="-webkit-app-region: no-drag"></div>
      <div class="right-no-drag" style="-webkit-app-region: no-drag"></div>
      <div class="btn-group">
        <div style="-webkit-app-region: no-drag" title="关闭" @click="closeWindow" class="close icon icon-close"></div>
        <div style="-webkit-app-region: no-drag" title="最小化" @click="minWindow"
             class="zuixiao icon icon-zuixiaohua"></div>
        <div style="-webkit-app-region: no-drag" :title="maxBtnTitle" @click="maxWindow"
             :class="`da-or-xiao icon icon-${maxBtnClassName}`"></div>
      </div>
    </div>
    <div :style="mainHeightStyle" class="main-content">
      <div style="width: 100%;height: 100%;" v-if="contentUrl">
        <VueScroll v-show="iframeIsLoadOk" :ops="scrollOps">
          <div v-show="iframeErrLoadShow" style="margin: auto;position:absolute" class="loadError">
            <h1 style="color: white; margin-top: 100px; font-weight: bold;">页面加载失败,请检查您的网络然后重新打开尝试!</h1>
          </div>
          <iframe :style="{height: iframeHeight}" @load="iframeOnLoad" class="content" :src="contentUrl"
                  frameborder="no" border="0" marginwidth="0" marginheight="0"
                  scrolling="no" allowtransparency="yes"></iframe>
        </VueScroll>
        <div v-show="!iframeIsLoadOk">
          <Spin fix/>
        </div>
      </div>
      <div style="margin: auto" v-if="!contentUrl">
        <h1 style="color: white; margin-top: 100px; font-weight: bold;">对不起打开应用失败了!</h1>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import {Vue, Component, Prop} from "vue-property-decorator";
  import VueScroll from "vuescroll"

  import {Spin} from "view-design"
  import {PostMessageData} from "@/views/layout/types";

  @Component({
    components: {
      VueScroll, Spin
    }
  })
  export default class WindowLayout extends Vue {

    private scrollOps = {
      scrollPanel: {
        scrollingX: false,
        scrollingY: true
      },
      bar: {
        background: '#cecece'
      }
    };

    @Prop({type: Function, required: false})
    private closeEven: (() => void) | undefined;

    @Prop({type: String, required: false})
    private contentUrl: string | undefined;

    @Prop({type: Boolean, default: false})
    private noHaveDrag!: boolean;

    private iframeHeight: number = 0;

    private mainContentBgc: string = "#333333";

    private iframeIsLoadOk: boolean = false;

    private iframeErrLoadShow:boolean = false;

    private maxBtnClassName: 'suoxiao' | 'fangda' = "fangda";

    private maxBtnTitle: '最大化' | '还原' = "最大化";

    private get mainHeightStyle(): any {
      let height = 25;
      if (this.noHaveDrag) {
        height = 0;
      }
      return {height: `calc(100% - ${height}px)`, backgroundColor: this.mainContentBgc}
    }

    private iframeOnLoad() {
      this.iframeIsLoadOk = true;
      setTimeout(()=>this.iframeErrLoadShow = true, 3000)
    }

    private minWindow() {
      this.electronRemote.getCurrentWindow().minimize();
    }

    private maxWindow() {
      if (this.maxBtnClassName === "fangda") {
        this.maxBtnClassName = "suoxiao";
        this.maxBtnTitle = "还原";
        this.electronRemote.getCurrentWindow().maximize();
      } else {
        this.maxBtnClassName = "fangda";
        this.maxBtnTitle = "最大化";
        this.electronRemote.getCurrentWindow().unmaximize();
      }
    }

    private closeWindow() {
      if ("function" == typeof this.closeEven) {
        this.closeEven();
        return
      }
      this.electronRemote.getCurrentWindow().close();
    }

    private created() {
      window.onmessage = ev => {
        const data: PostMessageData | undefined = ev.data;
        if (!data) {
          return
        }
        if (!(data.type instanceof Array)) {
          if (!data.type) {
            return;
          }
          this.messageHandleScroll(data.type, data);
          this.messageHandleBgc(data.type, data)
        } else {
          for (let postMsg in data.type) {
            this.messageHandleScroll(postMsg, data);
            this.messageHandleBgc(postMsg, data)
          }
        }
      }
    }

    private messageHandleScroll(type: string, data: PostMessageData) {
      if (type !== "loadScroll") {
        return
      }
      if (!data.contentHeight) {
        return;
      }
      this.iframeHeight = data.contentHeight;
      this.scrollOps = {...this.scrollOps};
      this.scrollOps.scrollPanel.scrollingY = true;
    }

    private messageHandleBgc(type: string, data: PostMessageData) {
      if (type != "settingBgc") {
        return
      }
      if (!data.bgcColor) {
        return;
      }
      this.mainContentBgc = data.bgcColor
    }
  }
</script>

<style lang="less" scoped>
  .window-area {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0;
    overflow: hidden;

    .top-drag, .main-content {
      position: relative;
      width: 100%;
    }

    .main-content {
      overflow: hidden;
      background-color: #333333;

      .content {
        /*display: block;*/
        position: absolute;
        /*top: 0;*/
        left: 0;
        /*right: 0;*/
        /*bottom: 0;*/
        width: 100%;
        min-height: 100%;
        margin: 0;
        border-style: none;
      }
    }

    .top-drag {
      height: 26px;
      background-color: #2F343F;
      overflow: hidden;

      .btn-group {
        width: 80px;
        height: 16px;
        line-height: 15px;
        text-align: center;
        margin-left: 8px;

        .close {
          background-color: #FF5B5D;
        }

        .close:hover {
          cursor: pointer;
          background-color: #FFA59C;
        }

        .zuixiao, .da-or-xiao {
          color: #999999;
          cursor: pointer;
        }

        .zuixiao:hover, .da-or-xiao:hover {
          color: #333333;
          cursor: pointer;
          background-color: rgba(255, 255, 255, 0.6);
        }

        div {
          font-size: 12px;
          width: 14px;
          height: 14px;
          border-radius: 16px;
          margin-top: 5px;
          cursor: pointer;
          float: left;
          margin-left: 8px;
        }

        .top-no-drag {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 2px;
          background-color: transparent;
        }

        .left-no-drag {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 2px;
          background-color: transparent;
        }

        .right-no-drag {
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0;
          width: 2px;
          background-color: transparent;
        }
      }
    }
  }
</style>
