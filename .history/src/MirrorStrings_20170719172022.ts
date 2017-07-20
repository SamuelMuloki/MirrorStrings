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
        // if (this.mfToExecute !== "") {
        //     this.execMf(this.mfToExecute, this.contextObj.getGuid());
        // }
    }

    private TextInput() {
        domConstruct.create("div", {
            class: "form-control",
            type: "text",
            value: "add new"
        }, this.domNode, )
        domConstruct.create("input", {
            class: "form-control btn-default",
            type: "button",
            value: "add new"
        }, this.domNode).addEventListener("click", () => {

        })
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
                        cb(objs);
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
