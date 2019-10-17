import ElementType from "../../../../../../common/ElementType.js";
import * as _ from 'lodash';

export default class FlowElement {
    name = null;
    objName = null;
    excludeObjName = false;
    elapsed=0;
    error="0";
    xtype="";
    address="";
    threadName="";
    parent=null;
    endTime = 0;
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
        const ret = [{id : this.id,elapsed : this.elapsed} ];
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
        ret["objName"]        = this.objName ? this.objName : "";
        ret["excludeObjName"] = this.excludeObjName;
        ret["threadName"]     = this.threadName ? this.threadName : "";
        ret["address"]        = this.address ? this.address : "";
        ret["type"]           = this.type;
        ret["elapsed"]        = this.elapsed;
        ret["txid"]           = this.id;
        ret["children"]       = [];
        ret["isError"]        = this.error !== "0" ? true : false;

        for(const value of this.children.values()){
            ret["children"].push(value.toTree());
        }
        return ret;
    }
    toElaped(){
        const elaps =  [];
        for(const value of this.children.values()){
            elaps.push(
                value.toArray()
                    .filter(_d => _d.elapsed > 0 )
                    .map(_d => {
                         return {
                             id  :_d.id,
                             dup : _d.elapsed
                         }})
            );

        }
        const flatMap = _.flatMapDeep(elaps);
        return {
            min : _.minBy(flatMap,(_d) => _d.dup),
            max : _.maxBy(flatMap,(_d) => _d.dup)
        }
    }
}