function readPackage(pkg) {

    if (pkg.name === '@mikro-orm/nestjs') {
        pkg.dependencies = {
            ...pkg.dependencies,
            "@nestjs/common": "^9.0.0",
            "@nestjs/core": "^9.0.0"
        }
    }

    else if (pkg.name === '@nestjs/common' || pkg.name === "@nestjs/core") {
        pkg.dependencies = {
            ...pkg.dependencies,
            "reflect-metadata": "^0.1.12",
            "rxjs": "^7.1.0"
        };
    }

    else if (pkg.name === "@chakra-ui/icons" || pkg.name === "@chakra-ui/icon") {
        pkg.dependencies = {
            ...pkg.dependencies,
            "@chakra-ui/system": ">=2.0.0 <3.0.0",
        };
    }

    else if(pkg.name === "@chakra-ui/react") {
        pkg.dependencies = {
            ...pkg.dependencies,
            "@chakra-ui/styled-system": ">=2.0.0"
        };
    }

    else if (pkg.name === "chakra-react-select") {
        pkg.dependencies = {
            ...pkg.dependencies,
            "@chakra-ui/system": "^2.0.0",
            "@chakra-ui/form-control": "^2.0.0",
            "@chakra-ui/icon": "^3.0.0",
            "@chakra-ui/layout": "^2.0.0",
            "@chakra-ui/menu": "^2.0.0",
            "@chakra-ui/spinner": "^2.0.0",
        };
    }

    else if (
        pkg.name === "@emotion/react"
        || pkg.name === "@emotion/babel-plugin"
        || pkg.name === "@emotion/styled"
        || pkg.name === "@babel/plugin-syntax-jsx"
        || pkg.name === "styled-jsx"
    ) {
        pkg.dependencies = {
            ...pkg.dependencies,
            "@babel/core": ">=7.0.0 <8.0.0",
        };
    }

    return pkg
}

module.exports = {
    hooks: {
        readPackage
    }
}
