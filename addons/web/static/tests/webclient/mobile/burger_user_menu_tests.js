/** @odoo-module **/

import {registry} from "@web/core/registry";
import {hotkeyService} from "@web/core/hotkeys/hotkey_service";
import {BurgerUserMenu} from "@web/webclient/burger_menu/burger_user_menu/burger_user_menu";
import {userService} from "@web/core/user_service";
import {makeTestEnv} from "@web/../tests/helpers/mock_env";
import {click, getFixture, mount} from "@web/../tests/helpers/utils";
import {markup} from "@odoo/owl";

const serviceRegistry = registry.category("services");
const userMenuRegistry = registry.category("user_menuitems");
let target;
let env;

QUnit.module("MobileBurgerUserMenu", (hooks) => {
    hooks.beforeEach(() => {
        serviceRegistry.add("user", userService);
        serviceRegistry.add("hotkey", hotkeyService);
        target = getFixture();
    });

    QUnit.test("can render in order with html content", async (assert) => {
        env = await makeTestEnv();
        userMenuRegistry.add("bad_item", function () {
            return {
                type: "item",
                id: "bad",
                description: "Bad",
                callback: () => {
                    assert.step("callback bad_item");
                },
                sequence: 10,
            };
        });
        userMenuRegistry.add("ring_item", function () {
            return {
                type: "item",
                id: "ring",
                description: "Ring",
                callback: () => {
                    assert.step("callback ring_item");
                },
                sequence: 5,
            };
        });
        userMenuRegistry.add("frodo_item", function () {
            return {
                type: "switch",
                id: "frodo",
                description: "Frodo",
                callback: () => {
                    assert.step("callback frodo_item");
                },
                sequence: 11,
            };
        });
        userMenuRegistry.add("separator", function () {
            return {
                type: "separator",
                sequence: 15,
            };
        });
        userMenuRegistry.add("invisible_item", function () {
            return {
                type: "item",
                id: "hidden",
                description: "Hidden Power",
                callback: () => {
                },
                sequence: 5,
                hide: true,
            };
        });
        userMenuRegistry.add("eye_item", function () {
            return {
                type: "item",
                id: "eye",
                description: "Eye",
                callback: () => {
                    assert.step("callback eye_item");
                },
            };
        });
        userMenuRegistry.add("html_item", function () {
            return {
                type: "item",
                id: "html",
                description: markup(`<div>HTML<i class="fa fa-check px-2"></i></div>`),
                callback: () => {
                    assert.step("callback html_item");
                },
                sequence: 20,
            };
        });
        await mount(BurgerUserMenu, target, {env});
        assert.containsN(target, ".o_user_menu_mobile .dropdown-item", 5);
        assert.containsOnce(target, ".o_user_menu_mobile .dropdown-item input.form-check-input");
        assert.containsOnce(target, "div.dropdown-divider");
        const children = [...(target.querySelector(".o_user_menu_mobile").children || [])];
        assert.deepEqual(
            children.map((el) => el.tagName),
            ["A", "A", "DIV", "DIV", "A", "A"]
        );
        const items = [...target.querySelectorAll(".dropdown-item")] || [];
        assert.deepEqual(
            items.map((el) => el.textContent),
            ["Ring", "Bad", "Frodo", "HTML", "Eye"]
        );
        for (const item of items) {
            click(item);
        }
        assert.verifySteps([
            "callback ring_item",
            "callback bad_item",
            "callback frodo_item",
            "callback html_item",
            "callback eye_item",
        ]);
    });
});