import { ui } from "../../ui/layaMaxUI";
import { Struct_Bag, Struct_Equip } from "../../custom/config/Struct";
import { GameCtrl } from "../GameCtrl";
import PetMono from "./PetMono";
import { UserData } from "./UserData";
import { CustomDefine } from "../../custom/CustomDefine";
import { UserCtrl } from "./UserCtrl";
import { AppCtrl } from "../AppCtrl";
import { MsgCtrl } from "../MsgCtrl";
import { VideoCtrl } from "../VideoCtrl";
import { BagData } from "../bag/BagData";
import { DataConfig } from "../../custom/config/DataConfig";
/**
 * 
 */
export default class UserUI extends BaseWindow {
    private lastX: number = 0;
    private menuIndex: number = 0;
    private productId: string = "";
    private pet_model_url:string = "3d/user/pet_0.lh";
    

    public ui: ui.user.UserUI;
    constructor() {
        super(ui.user.UserUI);
    }
    public init(): void {
        this.ui = this.view as ui.user.UserUI;

        let base64: Base64Type = new Base64Type("res/atlas/not/bg_main.jpg", "bg_main", "", "");
        SceneManager.ins.setBackground(base64);

        //加载模型
        Laya.loader.create(Define.CDN + this.pet_model_url, Laya.Handler.create(this, this.onComplete));

        // 使用但隐藏滚动条,这个不设置不会滚动
        this.ui.lstBag.vScrollBarSkin = "";
        this.ui.lstBag.selectEnable = true;
        this.ui.lstBag.selectHandler = new Laya.Handler(this, this.onSelect);
        this.ui.lstBag.renderHandler = new Laya.Handler(this, this.updateItem);

        this.ui.spTip.visible = false;
    }
    ////完成回调
	public  onComplete():void {
        var pet:Laya.Sprite3D = Laya.Loader.getRes(Define.CDN+ this.pet_model_url);
       
        console.log("加载到的宠物：",pet);
		GameCtrl.ins.pet = GameCtrl.ins.scene3D.addChild(pet) as Laya.Sprite3D;
        GameCtrl.ins.petMono=GameCtrl.ins.pet.addComponent(PetMono);
        //GameCtrl.ins.pet.transform.localScale=new Laya.Vector3(0.5,0.5,0.5);
        GameCtrl.ins.pet.transform.localRotation = new Laya.Quaternion(0,0,0);
        this.loadEquip();
	}

    private loadEquip():void{
        for(let equip of BagData.ins.arrEquip){
            GameCtrl.ins.petMono.changeEquip(equip.cfg.type,equip.itemId);
        }
    }

    public open():void{
        // Laya.stage.on(Laya.Event.MOUSE_DOWN,this,this.stageClick);
        this.ui.spRotate.on(Laya.Event.MOUSE_DOWN, this, this.MOUSE_DOWN);

        EventManager.ins.on(CustomDefine.EVENT_EQUIP, this, this.EVENT_EQUIP);
        this.EVENT_EQUIP();

        EventManager.ins.on(CustomDefine.EVENT_BAG, this, this.EVENT_BAG);
        this.EVENT_BAG();

        EventManager.ins.on(CustomDefine.EVENT_SAVE_EQUIP, this, this.EVENT_SAVE_EQUIP);

        EventManager.ins.on(CustomDefine.EVENT_GET_PRODUCT, this, this.EVENT_GET_PRODUCT);

        this.sp = new Sprite();
        this.ui.addChild(this.sp);
        VideoCtrl.ins.addVideo(this.sp);

       GameCtrl.ins.camera.transform.translate(new Laya.Vector3(0, 0, 3));
       GameCtrl.ins.camera.transform.rotate(new Laya.Vector3(0, 0, 0), true, false);
    }
    private sp:Sprite;

    //鼠标按下场景
    private MOUSE_DOWN(me: Laya.Event): void {
        this.lastX = me.stageX;
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.MOUSE_MOVE);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.MOUSE_UP);
    }
    //鼠标按下移动场景
    private MOUSE_MOVE(me: Laya.Event): void {//console.log(this.lastX,me.stageX);
        if (this.lastX < me.stageX) {
            GameCtrl.ins.petMono.rotate(0.1);
        } else {
            GameCtrl.ins.petMono.rotate(-0.1);
        }
        this.lastX = me.stageX;
    }
    //鼠标弹起场景
    private MOUSE_UP(): void {
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.MOUSE_MOVE);
        Laya.stage.off(Laya.Event.MOUSE_UP, this, this.MOUSE_UP);
    }

    public close(): void {
        Laya.stage.off(Laya.Event.CLICK, this, this.stageClick);
        Laya.timer.clearAll(this);
    }
    public viewClick(sp: Laya.Sprite): void {
        super.viewClick(sp);
        let spName: string = sp.name;
        if (spName.indexOf("btn_menu") >= 0) {
            this.menuIndex = Number(spName.replace("btn_menu", ""));
            this.clickMenu(this.menuIndex);
            return;
        }
        switch (spName) {
            case "btnSave":
                this.ui.btnSave.visible = false;
                UserCtrl.ins.saveEquip();
                break;
            case "btnGoBack":
                AppCtrl.ins.goBack();
                break;
            case "btnShop":
                AppCtrl.ins.goShop(this.productId);
                break;
            case "btnClear":
                //UIManager.ins.openWindow(CustomWindow.minRank);
                //UIManager.ins.openWindow(CustomWindow.minRecord);
                //GameCtrl.ins.showLoading();
                //MsgCtrl.ins.showMsg("123","4444",this.aa,{name:"andy"});
                VideoCtrl.ins.showVideo((this.i++%2)==0);
                 //GameCtrl.ins.canvasCutImg(this.ui.imgBox,this.ui.imgBase64);
                //GameCtrl.ins.changeHtmlBg("bg_min2.jpg");
                break;
            default:
                break;
        }
    }
    private i:number=0;
    private stageClick(): void {

    }

    //身上装备数据
    private EVENT_EQUIP(): void {
        for (let i = 1; i <= CustomDefine.PET_EQUIP_COUNT; i++) {
            this.setEquip(i);
        }
    }
    private setEquip(type: number): void {
        let equipData: Struct_Equip = BagData.ins.getEquipByType(type);
        let itemEquip: ui.user.ItemEqiupUI = this.ui["itemEquip" + type];
        if (equipData) {
            itemEquip.imgIcon.skin = BagData.ins.getIconPath(equipData.id);
            itemEquip.txtName.text = equipData.cfg.name;
            if(GameCtrl.ins.petMono)
            GameCtrl.ins.petMono.changeEquip(equipData.cfg.type,equipData.itemId);
        } else {
            itemEquip.imgIcon.skin = null;
            itemEquip.txtName.text = BagData.ins.arrEquipName[type];
        }
    }

    //背包数据
    private EVENT_BAG(): void {
        this.clickMenu(this.menuIndex);
    }
    private clickMenu(menuIndex: number): void {
        this.ui.lstBag.array = BagData.ins.getBagByType(menuIndex);

        for (let i = 0; i < 4; i++) {
            this.ui["btn_menu" + i].visible = i != menuIndex;
        }
        this.ui.imgMenuSel.x = this.ui["btn_menu" + menuIndex].x;
    }
    private updateItem(cell: ui.user.ItemBagUI, index: number): void {
        let bag: Struct_Bag = this.ui.lstBag.array[index];
        cell.imgIcon.skin = BagData.ins.getIconPath(bag.id);
        cell.txtName.text = bag.cfg.name;
    }
    private onSelect(index: number): void {
        console.log("当前选择的索引：" + index);
        let bag: Struct_Bag = this.ui.lstBag.array[index];
        let equipData: Struct_Equip = BagData.ins.getEquipByType(bag.cfg.type);
        if (!equipData) {
            equipData = new Struct_Equip();
            BagData.ins.arrEquip[bag.id] = equipData;
        }

        equipData.id = bag.id;
        equipData.itemId = bag.itemId
        equipData.cfg = DataConfig.ins.getItemById(bag.itemId);


        this.setEquip(bag.cfg.type);

        //UserCtrl.ins.getProduct(bag.model);
    }

    //保存装备
    private EVENT_SAVE_EQUIP(): void {

        GameCtrl.ins.petMono.show();
        Laya.timer.once(3000, this, () => {
            this.ui.btnSave.visible = true;
        })
    }

    //商店信息
    private EVENT_GET_PRODUCT(obj: any): void {
        this.ui.spTip.visible = true;
        this.ui.txtName.text = obj.data.name && obj.data.name.substring(0, 5);
        this.ui.txtDesc.text = obj.data.desc && obj.data.desc;

        this.productId = obj.data.spu_id;

    }
}