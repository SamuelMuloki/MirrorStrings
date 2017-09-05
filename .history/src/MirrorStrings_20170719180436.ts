import * as dojoDeclare from "dojo/_base/declare";
import * as domConstruct from "dojo/dom-construct";
import * as WidgetBase from "mxui/widget/_WidgetBase";
import * as dojoClass from "dojo/dom-class";

class MirrorStrings extends WidgetBase {

    // Parameters configured in modeler
    reverseEntity: string;
    mfToExecute: string;
    dataAttribute: string;

    // Internal variables
    private contextObj: mendix.lib.MxObject;
    private message: string;
    private textString: string;

    postCreate() {
        this.setupEvents();
    }

    update(object: mendix.lib.MxObject, callback?: () => void) {
        this.contextObj = object;
        //this.resetSubscriptions();
        this.updateRendering();

        if (callback) {
            callback();
        }
    }

    uninitialize(): boolean {
        return true;
    }

    private setupEvents() {
        if (this.mfToExecute !== "") {
            //this.execMf(this.mfToExecute, this.contextObj.getGuid());
        }
    }

    private TextInput() {
        domConstruct.create("input", {
            class: "form-control",
            type: "text",
            value: "Place some Text Here"
        }, this.domNode).addEventListener("mouseleave", () => {
            this.setupEvents();
        })

        domConstruct.create("input", {
            class: "form-control btn-default",
            type: "button",
            value: "add new"
        }, this.domNode).addEventListener("click", () => {
            this.createTag();
        })
    }

    private createTag() {
        let dataatttr = this.dataAttribute
        let txtstr = this.textString
        mx.data.create({
            entity: this.reverseEntity,
            callback: (function (obj: mendix.lib.MxObject) {
                obj.set(dataatttr, txtstr)
                //this.saveTag(obj)
                console.log("Object created on server");
            }),
            error: function (e) {
                console.error("Could not commit object:", e);
            }
        });
    }

    private saveTag(object: mendix.lib.MxObject) {
        mx.data.commit({
            mxobj: object,
            callback: function () {
                console.log("Object committed");
            },
            error: function (e) {
                console.error("Could not commit object:", e);
            }
        });
    }

    private updateRendering() {
        if (this.contextObj !== null) {

        }
    }

    private execMf(mf: string, guid: string, cb: () => void) {
        // logger.debug(this.id + "._execMf");
        if (mf && guid) {
            mx.ui.action(mf, {
                params: {
                    applyto: "selection",
                    guids: [guid]
                },
                callback: (function (objs: mendix.lib.MxObject) {
                    if (cb && typeof cb === "function") {
                        // cb(objs);
                    }
                }.bind(this)),
                error: function (error) {
                    mx.ui.error("Error executing microflow " + mf + " : " + error.message);
                }
            }, this);
        }
    }
}


// tslint:disable : only-arrow-functions
dojoDeclare("MirrorStrings.widget.MirrorStrings", [WidgetBase], function (Source: any) {
    const result: any = {};
    for (const i in Source.prototype) {
        if (i !== "constructor" && Source.prototype.hasOwnProperty(i)) {
            result[i] = Source.prototype[i];
        }
    }
    return result;
}(MirrorStrings));
