import { GameCtrl } from "../GameCtrl";
import { BaseNotice, PLAYBEFOREANITYPE } from "./BaseNotice";
import { PublicNoticeMgr } from "./PublicNoticeMgr";

/**视频 */
export class VidioNotice extends BaseNotice {
    divElement: any;
    videoElement: any;
    private _box: Laya.Box;
    parent: Sprite;
    data: any;
    constructor() {
        super()
    }

    onInto(data, parent: Laya.Sprite, callback: Function) {
        super.onInto(data, parent, callback);
        this.parent = parent;
        this.data = data;
        callback();
    }

    addVideo(sp: Laya.Sprite, url, callback) {
        let divElement = Laya.Browser.createElement("div");
        divElement.className = "div";
        Laya.Browser.document.body.appendChild(divElement);
        //divElement.style.zInddex = Laya.Render.canvas.style.zIndex - 1;
        Laya.Utils.fitDOMElementInArea(divElement, sp, 0, 0, sp.width, sp.height);//Laya.stage.width, Laya.stage.height); 
        this.divElement = divElement;
        // 创建Video元素
        let videoElement = Laya.Browser.createElement("video");
        videoElement.setAttribute("id", "myvideo");
        this.videoElement = videoElement;
        videoElement.controls = false;
        videoElement.autoPlay = true;
        videoElement.muted = true;
        // 阻止IOS视频全屏
        videoElement.setAttribute("webkit-playsinline", true);
        videoElement.setAttribute("playsinline", true);
        videoElement.setAttribute("x5-video-player-type", 'h5');
        videoElement.setAttribute("x-webkit-airplay", true);
        videoElement.setAttribute("x5-video-orientation", "portrait");

        videoElement.setAttribute('preload', 'auto');
        videoElement.setAttribute('width', '100%');
        videoElement.setAttribute('height', '100%');
        videoElement.setAttribute('display', 'block');
        videoElement.setAttribute('object-fit', 'cover');

        videoElement.type = "vedio/mp4";
        videoElement.src = (url == "") ? "res/video/test.mp4" : url;

        this.divElement.appendChild(this.videoElement);
        this.divElement.style.display = "none";
        this.videoEvent()
        callback()
    }

    reset() {
        // this.onStop();
    }

    onStart(): void {
        this.addVideo(this.parent, this.data.url, () => {
            PublicNoticeMgr.ins().playAni(PLAYBEFOREANITYPE.snowflake, () => {

                if (!this.divElement) return
                this.divElement.style.display = "";
                this.videoElement.play();
            });
        });

    }

    onStop() {
        this.removeVideoElement();
        this.onDestory();
        // PublicNoticeMgr.ins().behaviorStop();
    }

    //移除播放器
    removeVideoElement() {

        if (this.divElement.children.length > 0) {
            this.divElement.removeChild(this.videoElement)
        }

    }

    onDestory() {
        this.removeEventListener();
        if (this.divElement) {
            Laya.Browser.removeElement(this.videoElement);
            Laya.Browser.removeElement(this.divElement);
            this.videoElement = null;
            this.divElement = null;
        }
    }

    loadstart() { //console.log("加载事件")
    }
    progress() { //console.log("下载监听事件") 
    }
    play() { //console.log("播放事件")
    }
    pause() {

    }
    seeking() {

    }
    seeked() { //console.log("进度条移动完成事件")
    }
    waiting() { //console.log("视频加载等待事件") 
    }
    timeupdate() { //console.log("频实时更新进度事件") 
    }
    ended() {
        //console.log("播放完成事件")
        // this.onStop();
        PublicNoticeMgr.ins().curBaseNotice.onStop()
        PublicNoticeMgr.ins().behaviorStart();
    }
    error() { //console.log("播放出错") 
    }

    private videoEvent() {
        if (!this.videoElement) return
        let self = this;
        this.videoElement.addEventListener("loadstart", self.loadstart);
        this.videoElement.addEventListener("progress", self.progress);
        this.videoElement.addEventListener("play", self.play);
        this.videoElement.addEventListener("pause", self.pause);
        this.videoElement.addEventListener("seeking", self.seeking);
        this.videoElement.addEventListener("seeked", self.seeked);
        this.videoElement.addEventListener("waiting", self.waiting);
        this.videoElement.addEventListener("timeupdate", self.timeupdate);
        this.videoElement.addEventListener("ended", self.ended);
        this.videoElement.addEventListener("error", self.error);

    }

    removeEventListener() {
        if (!this.videoElement) return;
        let self = this;
        this.videoElement.removeEventListener("loadstart", self.loadstart);
        this.videoElement.removeEventListener("progress", self.progress);
        this.videoElement.removeEventListener("play", self.play);
        this.videoElement.removeEventListener("pause", self.pause);
        this.videoElement.removeEventListener("seeking", self.seeking);
        this.videoElement.removeEventListener("seeked", self.seeked);
        this.videoElement.removeEventListener("waiting", self.waiting);
        this.videoElement.removeEventListener("timeupdate", self.timeupdate);
        this.videoElement.removeEventListener("ended", self.ended);
        this.videoElement.removeEventListener("error", self.error);
    }
}