/**This class is automatically generated by LayaAirIDE, please do not make any modifications. */
import LoadingUI from "./script/LoadingUI"
import GameUI from "./script/GameUI"
import { HTMLDivElement } from "laya/html/dom/HTMLDivElement"
import { ClassUtils } from "laya/utils/ClassUtils";
import { ui } from "./ui/layaMaxUI";
/*
* 游戏初始化配置;
*/
export default class GameConfig{
    static width:number=640;
    static height:number=1136;
    static scaleMode:string="fixedwidth";
    static screenMode:string="none";
    static alignV:string="top";
    static alignH:string="left";
    static startScene:any="Loading.scene";
    static sceneRoot:string="";
    static debug:boolean=false;
    static stat:boolean=false;
    static physicsDebug:boolean=false;
    static exportSceneToJson:boolean=true;
    constructor(){}
    static init(){
        var reg: Function = ClassUtils.regClass;
		reg("ui", ui);
        reg("script/LoadingUI.ts",LoadingUI);
        reg("script/GameUI.ts",GameUI);
        reg("Laya.HTMLDivElement",HTMLDivElement);
    }
}
GameConfig.init();