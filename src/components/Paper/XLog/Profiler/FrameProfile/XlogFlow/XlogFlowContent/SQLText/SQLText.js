import React from "react";
import sqlFormatter from "sql-formatter";
import "./SQLText.css"

export default class SQLText extends React.Component{


    render(){
        const {sql,prefix} = this.props.meta;
        return <div className="sql-text">
            <div className="sql-statement formatter" >
             <span className="prefix">{prefix}</span>
                {
                    sqlFormatter.format(sql,{
                    indent: "  "
                    })
                }
            </div>
        </div>


    }


}
