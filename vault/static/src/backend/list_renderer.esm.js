/** @odoo-module **/

import {ListRenderer} from "@web/views/list/list_renderer";
import {patch} from "@web/core/utils/patch";

patch(ListRenderer.prototype, {
    getCellTitle(column) {
        const _super = this._super.bind(this);
        const attrs = column.rawAttrs || {};
        if (attrs.widget !== "vault_field") return _super(...arguments);
    },
});
