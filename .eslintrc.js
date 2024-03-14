module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "tsconfig.json",
    },
    settings: {
        react: {
            version: "detect",
        },
    },
    plugins: ["prettier", "@typescript-eslint"],
    extends: [
        "airbnb-typescript",
        "airbnb/hooks",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier",
        "prettier/react",
        "prettier/@typescript-eslint",
        "plugin:prettier/recommended",
    ],
    rules: {
        "prettier/prettier": "error",
        "react/react-in-jsx-scope": "off",
    },
};
