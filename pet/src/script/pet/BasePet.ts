import { BehaviourMgr, PETBEHAVIOURTYPE } from "./BehaviourMgr";


export class basePet {
    //体力
    protected labour: number = 0
    //行为
    protected behaviour: BehaviourMgr;

    protected onDestroy() { }

}