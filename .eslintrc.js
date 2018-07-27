module.exports = {
    "env": {
        "browser": true,
        "commonjs": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console": [
            "off"
        ],
        //window和linux 换行符不一样
        "linebreak-style": "off",
        //禁止定义未使用变量
        "no-unused-vars": "off",
        //禁止全局变量
        "no-undef": "off"
    }
};