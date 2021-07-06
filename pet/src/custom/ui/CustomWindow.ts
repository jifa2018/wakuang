import LoadingUI from "../../script/LoadingUI";
import MinUI from "../../script/min/MinView";
import GameUI from "../../script/user/UserUI";
import UserUI from "../../script/user/UserUI";
import MinRankUI from "../../script/min/MinRankUI";
import MinRecordUI from "../../script/min/MinRecordUI";
import { MinDoorUI } from "../../script/min/MinDoorUI";
import { MinDoorTip } from "../../script/min/MinDoorTipUI";
/*
* name;
*/
export class CustomWindow {
    constructor() {

    }

    public static loading: UIType = new UIType("loading", LoadingUI);
    //public static main:UIType=new UIType("main",MainWin);
    // public static bag:UIType=new UIType("bag",BagWin);
    // public static rank:UIType=new UIType("rank",RankWin);
    public static game: UIType = new UIType("game", GameUI);

    // public static gameOver:UIType=new UIType("gameOver",GameOverWin);
    // public static loading: UIType = new UIType("loading", LoadingUI);
    public static user: UIType = new UIType("user", UserUI);
    public static min: UIType = new UIType("min", MinUI);
    public static minRank: UIType = new UIType("minRank", MinRankUI);
    public static minRecord: UIType = new UIType("minRecord", MinRecordUI);
    public static minDoor: UIType = new UIType("minDoor", MinDoorUI);
    public static minDoorTip: UIType = new UIType("minDoorTip", MinDoorTip);

}