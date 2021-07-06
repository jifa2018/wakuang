import { UserData } from "./user/UserData";
import { HttpManager } from "../manager/HttpManager";
import { Test } from "./Test";
import { CustomDefine } from "../custom/CustomDefine";
import { LoadingCtrl } from "./LoadingCtrl";
/*
* 2021-06-11 andy
	控制视频播放，调用原生video
*/
export class VideoCtrl {
	public divElement:any;
	public videoElement:any;

	private static _ins: VideoCtrl;
	public static get ins(): VideoCtrl {
		if (!this._ins)
		VideoCtrl._ins = new VideoCtrl();
		return this._ins;
	}
	constructor() {
		if (VideoCtrl._ins != null)
			throw new Error("VideoCtrl is single!");
	}
	public init(): void {
	
	}

	public addVideo(sp:Laya.Sprite){
        let divElement = Laya.Browser.createElement("div");
        divElement.className = "div";
        Laya.Browser.document.body.appendChild(divElement);         
        Laya.Utils.fitDOMElementInArea(divElement,sp , 162, 0, 800,600);//Laya.stage.width, Laya.stage.height); 
        this.divElement = divElement;
        // this.divElement.style.display = "none";

        // 创建Video元素
        let videoElement = Laya.Browser.createElement("video");
        videoElement.setAttribute("id", "myvideo");
        this.videoElement = videoElement;      
        videoElement.controls = false;
        videoElement.autoPlay = false;
        // 阻止IOS视频全屏
        videoElement.setAttribute("webkit-playsinline", true);
        videoElement.setAttribute("playsinline", true);
        videoElement.setAttribute("x5-video-player-type",'h5');
        videoElement.setAttribute("x-webkit-airplay",true);
        videoElement.setAttribute("x5-video-orientation","portrait");
        
        videoElement.setAttribute('preload', 'auto');
        videoElement.setAttribute('width', '100%');
        videoElement.setAttribute('height', '100%');
         
        //videoElement.style.zInddex = Laya.Render.canvas.style.zIndex + 1;      
        videoElement.type = "vedio/mp4";     
        videoElement.src = Define.CDN+"mp4/ad.mp4";
        //videoElement.play();
        divElement.appendChild(videoElement);  
    }

	public showVideo(isShow:boolean = true):void{
		if(isShow){
			this.divElement.style.display="";
			this.videoElement.play();
		}else{
			this.videoElement.pause();
			this.divElement.style.display="none";
		}
		
	}



    private videoEvent(){ 
        this.videoElement.addEventListener("loadstart",()=>{
            //加载事件
        });   
         this.videoElement.addEventListener("progress",()=>{
            //下载监听事件
        });
         this.videoElement.addEventListener("play",()=>{
            //播放事件
        });
         this.videoElement.addEventListener("pause",()=>{
            //暂停事件
        });
         this.videoElement.addEventListener("seeking",()=>{
            //移动进度条事件
        });
         this.videoElement.addEventListener("seeked",()=>{
            //进度条移动完成事件
        });
         this.videoElement.addEventListener("waiting",()=>{
            //视频加载等待事件
        });
         this.videoElement.addEventListener("timeupdate",()=>{
            //视频实时更新进度事件
        });
        this.videoElement.addEventListener("ended",()=>{
            //播放完成事件
        });
        this.videoElement.addEventListener("error",()=>{
            //播放出错
        });
        
    }

}