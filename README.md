<br />
<div align="center">
  <a href="#">
    <img src="https://git.maxg.cloud/max/DocObject/raw/branch/master/img/docobject_logoTextRight.svg" alt="Logo" width="120" height="80">
  </a>

  <h3 align="center">DocObject</h3>
    <div align="center">

[![view - Documentation](https://img.shields.io/badge/view-Documentation-blue?style=for-the-badge)](/wiki/ "Go to project documentation")

</div>
  <p align="center">
    A Lightweight (jQuery optional) Plugin to structure page updates
    <br />
  </p>
</div>

<!-- ABOUT -->
## What is DocObject

DocObject is a simple Script/jQuery Plugin that aims to help structure page updates/injections. DocObject is designed to fit into existing websites as well as new projects. DocObject can be used to manage a single element up to an entire document.

DocObject comes with **plug-and-play jQuery support** but also **may be used without jQuery**

* [JQuery](https://jquery.com)


## Documentation
- [Binds](https://github.com/MaxG-Git/DocObject/wiki/Binds) - DocObject's core for managing DOM updates
- [DocGen](https://github.com/MaxG-Git/DocObject/wiki/DocGen) - DocObject's Bundled HTML Generator
- Values - *Documentation In Progress*
- Render *Documentation In Progress*
- [Elements](https://github.com/MaxG-Git/DocObject/wiki/Elements) - *Documentation In Progress*



<br />

<!-- GETTING STARTED -->
## Quick Start

When using DocObject with jQuery, ensure to load jQuery before loading DocObject.

```html
    <!-- jQuery Here (Optional for jQuery Mode support) -->

    <!-- DocObject -->
    <script src="https://cdn.jsdelivr.net/gh/MaxG-Git/DocObject/dist/docobject.bundle.min.js"></script>
```


DocObject ships with the global variable `Doc`. The `Doc` variable is how we can access DocObject Functions.
To get started we can first look at the `.obj` function which generates a DocObject and attaches it to the `root` Dom Object.

We may achieve the same result by using the `$.DocObject` function added to jQuery by DocObject

<br />

##### DocObject No jQuery

```js
var obj = Doc.obj(document.body, {
    values: {
        message: 'Hello World!',
    },
    binds : {
        this : ({message}) => g => g.h1(message),
    }
});
```

##### DocObject with jQuery

```js
var obj = $(document.body).DocObject({
    values: {
        message: 'Hello World!',
    },
    binds : {
        this : ({message}) => g => g.h1(message),
    }
});
```

<br />

## Overview
The following we can see a DocObject instance with all options available set to their respective default values when no option is provided. For more in depth description of each option view the [Documentation](https://github.com/MaxG-Git/DocObject#documentation) Section.
```js
var obj = Doc.obj(document.body, {
    values: {
    },
    elements: {
    },
    binds: {
    },
    render: [
    ],
    isJQuery: false, //Override jQuery Mode
    bindAttr:'d-bind', //Attribute used for bind tags (not including shipped tag)
    bindInAttr: 'd-bind-in', //Attribute used for bind-in (not including shipped tag)
    removeOnload: false //Removes onLoad event to run render/binds on document load
});
```

## Credits
- [Best-README-Template](https://github.com/othneildrew/Best-README-Template)