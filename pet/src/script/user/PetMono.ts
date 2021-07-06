import { BagData } from "../bag/BagData";
import GameUI from "./UserUI";

export default class PetMono extends Laya.Script3D {
    public transform : Laya.Transform3D = null;
    protected rigidbody : Laya.Rigidbody3D = null;
    public animator:Laya.Animator;

    /** 骨骼挂点 */
    private arrBoneTrans:Array<Laya.Transform3D>;
    /** 骨骼挂点 */
    private mapBoneEquip:Map<number,Laya.Sprite3D>;

    private rotation:Laya.Vector3;

    public gameUI:GameUI;

    public  onAwake():void {
        this.transform=(this.owner as Laya.Sprite3D).transform;
        this.rigidbody = this.owner.getComponent(Laya.Rigidbody3D);
        this.animator = this.owner.getComponent(Laya.Animator);
        this.rotation = new Laya.Vector3(0,0,0);
    }
    public onStart() : void{
        //this.rigidbody.clearForces();
        //this.rigidbody.angularFactor = new Laya.Vector3(0,0,0);
        //this.animator.play("show");
        this.mapBoneEquip=new Map<number,Laya.Sprite3D>();
        this.arrBoneTrans=[];
        for(let i=1;i<12;i++){
            let boneName:string = BagData.ins.arrEquipBone[i];
            let bone:Laya.Sprite3D = this.findChild(this.owner,boneName) as Laya.Sprite3D;
            if(bone){
                this.arrBoneTrans[i]=bone.transform;
                console.log(boneName,bone.transform);
            }
        }
    }
    public onUpdate() :void{
        
    }
    public setGameUI(v:GameUI):void{
        this.gameUI= v;
    }
    public onCollisionEnter(collision:Laya.Collision):void {
        //console.log('碰撞了');
        
    }
    /** 保存装备后，展示一下动作 */
    public show():void{
        this.animator.play("show");
        Laya.timer.once(4000,this,()=>{
            this.animator.play("idle");
        })
    }

    public rotate(value:number):void{
        this.rotation.setValue(0,value,0);
        this.transform.rotate(this.rotation);
    }
    
    
    
    /**
     * 更换装备
     * @param equipType 装备部位
     * @param itemId    道具ID
     */
    public changeEquip(equipType:number,itemId:number):void{
        let path:string = BagData.ins.getModelPath(itemId);
        //加载模型
        Laya.loader.create(path, Laya.Handler.create(this, (obj)=>{
            this.loadEquipFinish(obj);
        },[[equipType,path]]));
    }
    private loadEquipFinish(obj:any):void{
        let equipType:number = obj[0];
        let path:string = obj[1];
        //新装备
        let equip:Laya.Sprite3D = Laya.loader.getRes(path);
        equip = equip.clone() as Laya.Sprite3D;
        //装备节点
        let bone:Laya.Transform3D  = this.arrBoneTrans[equipType];
        if(bone){
            //更换新装备
            bone.owner.parent.addChild(equip);
            equip.transform.localPosition = bone.localPosition;
            equip.transform.localRotation = bone.localRotation;
           // equip.transform.localRotationEuler = bone.localRotationEuler;
            //若有旧装备，删除
            let oldEquip:Laya.Sprite3D = this.mapBoneEquip.get(equipType);
            if(oldEquip){
                oldEquip.parent.removeChild(oldEquip);
            }
            this.mapBoneEquip.set(equipType,equip);

            let originName:string = BagData.ins.arrEquipBone[equipType];
            originName=originName.replace("_point","");
            let head:Laya.MeshSprite3D = this.owner.getChildByName(originName) as Laya.MeshSprite3D;
            if(head){
                head.removeSelf();
            }
        }
    }


     /**
     * 查找节点
     * @param sp 精灵
     * @param name 需要查找的节点名
     */
      private findChild(sp,name){
        if(sp.name==name)
            return sp;
        else
            return this._findChild(sp._children,name);
    }
    private _findChild(spArr,name){
        var arr:Array<any> = [];
        for(var i = 0;i < spArr.length ; i++ ){
            var child = spArr[i];
            if(child.name==name){
                return child;
            }
            else if(child.numChildren){
                arr = arr.concat(child._children);
            }
        }
        if(!arr.length)
            return null;
        return this._findChild(arr,name);
    }
}