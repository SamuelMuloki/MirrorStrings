import * as dojoDeclare from "dojo/_base/declare";
import * as domConstruct from "dojo/dom-construct";
import * as WidgetBase from "mxui/widget/_WidgetBase";
import * as dojoClass from "dojo/dom-class";
import * as dojoStyle from "dojo/dom-style";
import * as dom from "dojo/dom";

class MirrorStrings extends WidgetBase {

    // Parameters configured in modeler
    reverseEntity: string;
    mfToExecute: string;
    dataAttribute: string;

    // Internal variables
    private contextObj: mendix.lib.MxObject;
    private message: string;
    private textString: string;
    private msg: string;

    postCreate() {
        console.log("Your program has executed postCreate");
    }

    update(object: mendix.lib.MxObject, callback?: () => void) {
        this.contextObj = object;
        this.resetSubscriptions();
        this.updateRendering();
        if (callback) {
            callback();
        }
    }

    private TextInput() {
        domConstruct.empty(this.domNode);
        domConstruct.create("input", {
            class: "form-control",
            type: "Place Some text here",
            id: "text_node"
        }, this.domNode).addEventListener("mouseleave", () => {
            if (this.mfToExecute) {
                this.execMf(this.mfToExecute, this.contextObj.getGuid());
            }
        });

        domConstruct.create("input", {
            class: "form-control",
            type: "text",
            value: this.reverseString(this.msg)
        }, this.domNode);

        domConstruct.create("input", {
            class: "form-control btn-default",
            type: "button",
            value: "Post"
        }, this.domNode).addEventListener("click", () => {
            this.createTag();
        });
    }

    private reverseString(str: string) {
        return str.split("").reverse().join("");
    }

    private createTag() {
        var refnode = dom.byId("text_node");
        mx.data.create({
            entity: this.reverseEntity,
            callback: (obj: mendix.lib.MxObject) => {
                obj.set(this.dataAttribute, refnode.value);
                this.saveTag(obj);
                console.log("Object created on server");
            },
            error: (e) => {
                console.error("Could not commit object:", e);
            }
        });
    }

    private saveTag(object: mendix.lib.MxObject) {
        mx.data.commit({
            mxobj: object,
            callback: () => {
                console.log("Object committed");
            },
            error: (e) => {
                console.error("Could not commit object:", e);
            }
        });
    }

    private updateRendering() {
        if (this.contextObj) {
            dojoStyle.set(this.domNode, "hidden");
            this.msg = this.contextObj.get(this.dataAttribute) as string;
            this.TextInput();
        } else {
            dojoStyle.set(this.domNode, "hidden");
        }
    }

    private execMf(mf: string, guid: string, cb?: (obj: mendix.lib.MxObject) => void) {
        if (mf && guid) {
            mx.ui.action(mf, {
                params: {
                    applyto: "selection",
                    guids: [ guid ]
                },
                callback: (objs: mendix.lib.MxObject) => {
                    if (cb && typeof cb === "function") {
                        cb(objs);
                    }
                },
                error: (error) => {
                    mx.ui.error("Error executing microflow " + mf + " : " + error.message);
                }
            }, this);
        }
    }

    private resetSubscriptions() {
        this.unsubscribeAll();
        if (this.contextObj) {
            this.subscribe({
                callback: () => this.updateRendering(),
                guid: this.contextObj.getGuid()
            });
        }
    }
}

dojoDeclare("widget.MirrorStrings", [WidgetBase], function (Source: any) {
    const result: any = {};
    for (const i in Source.prototype) {
        if (i !== "constructor" && Source.prototype.hasOwnProperty(i)) {
            result[i] = Source.prototype[i];
        }
    }
    return result;
}(MirrorStrings));
