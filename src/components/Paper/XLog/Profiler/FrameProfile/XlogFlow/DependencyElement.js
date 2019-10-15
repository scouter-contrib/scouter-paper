export default class DependencyElement {
    name = null;
    elapsed=-1;
    error="";
    xtype="";
    address="";
    threadName="";
//-
    type;
    id;
    dupleCnt = 1;
//-- add
    children;
    tags = {};
    constructor(obj={type:"0", id: "-1"}){
        this.id = obj.id;
        this.type = obj.type;
        this.children = new Map();
    };

    addChild(child){
        const childObj = this.children.get(child.id);
        if(childObj){
            childObj.dupleCnt += child.dupleCnt;
            childObj.elapsed += child.elapsed;
            if (!child.error) {
                childObj.error = child.error;
            }
        }else{
            this.children.set(child.id,child);
        }
    }
}