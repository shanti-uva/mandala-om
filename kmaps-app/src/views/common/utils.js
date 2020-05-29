import _ from "lodash";

export function buildNestedDocs(docs, child_type, path_field) {

    path_field = (path_field) ? path_field : child_type + "_path_s";

    const base = {};
    docs = _.filter(docs, (x) => {
        return x.block_child_type === child_type;
    });

    console.log("buildNestedDocs: ", docs)

    _.forEach(docs, (doc,i) => {
        console.log("buildNestedDocs: i=" +i);
        console.log("buildNestedDocs: pathField = " + path_field);
        const path = doc[path_field].split('/');
        console.log("buildNestedDocs path = " + path);
        doc.order=i;
        console.log("buildNestedDocs path.length == " + path.length);
        if (path.length === 1) {
            // this is a "root doc", push it on the base list
            base[path[0]] = doc;
        } else {
            // this is a "nested doc"
            // this is a "nested doc"

            // check for each "ancestor"
            // create  "fake ancestor", if it doesn't exist
            // add the doc to its parent in _nestedDoc_ field
            //      created _nestedDoc_ field if it doesn't exist
            //      if it already exists (it might have been faked earlier), populate fields
            console.log("buildNestedDocs: nested path = ", path);
            var curr = base;
            for (let i = 0; i < path.length; i++) {
                console.log("buildNestedDocs segment: " + path.slice(0, i + 1).join("/"));
                if (!curr[path[i]]) {
                    curr[path[i]] = {};
                }
                if (i === path.length - 1) {
                    curr[path[i]] = doc;
                }
                if (!curr[path[i]]._nested_) {
                    curr[path[i]]._nested_ = {};
                }
                curr = curr[path[i]]._nested_;
            }

        }
    })
    console.log("buildNestedDocs:", base);
    return base;
}
