import ElementType from "../../../../../../common/ElementType.js";

export default class FlowElement {
    name = null;
    objName = null;
    excludeObjName = false;
    elapsed=0;
    error="";
    xtype="";
    address="";
    threadName="";
    parent=null;
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
            child.parent = this.id;
            this.children.set(child.id,child);
        }
    }
    toArray(){
        const ret = [];
        for(const value of this.children.values()){
            ret.push(value);
        }
        return ret;
    }
    typeToname(){
        switch(this.type){
            case ElementType.defaultProps.SQL:
            case ElementType.defaultProps.API_CALL:
                return this.name;
            case ElementType.defaultProps.DISPATCH:
            case ElementType.defaultProps.THREAD:
                return this.threadName ?  `${this.name} \n < ${this.threadName} >` : this.name;
            default :
                return this.address ? `${this.name} \n : ${this.address}` : this.name;
        }
    }
    toTree(){
        const ret = {};

        ret["name"]           = this.name;
        ret["objName"]        = this.objName;
        ret["excludeObjName"] = this.excludeObjName;
        ret["threadName"]     = this.threadName;
        ret["address"]        = this.address;
        ret["type"]           = this.type;
        ret["elapsed"]        = this.elapsed;
        ret["children"]       = [];
        ret["isError"]        = this.error ? true : false;

        for(const value of this.children.values()){
            ret["children"].push(value.toTree());
        }
        return ret;
    }

}