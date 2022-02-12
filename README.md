<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="#">
    <img src="img\docobject_logoTextRight.svg" alt="Logo" width="120" height="80">
  </a>

  <h3 align="center">DocObject</h3>

  <p align="center">
    A Lightweight jQuery Plugin to structure page updates
    <br />
    <a href="examples\index.html"><strong>Explore the docs »</strong></a>
  </p>
</div>

<!-- ABOUT -->
## What is DocObject
DocObject is a simple jQuery Plugin that aims to help structure page updates/injections. DocObject is designed to fit into existing jQuery powered websites as well as new projects. DocObject can be used to manage a single element up to an entire document.

### Built With
DocObject is mainly built off jQuery and depends on jQuery functions.
* [JQuery](https://jquery.com)

<!-- GETTING STARTED -->
## Getting Started
To use DocObject jQuery must be compiled first. To ensure jQuery uis complied simply add jQuery before including DocObject.
```html
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"
        integrity="..." crossorigin="anonymous"></script>
    <!-- DocObject -->
    <script src="/js/DocObject.js"></script>
```

## Usage
To get started using DocObject we can use first look at the `$.DocObject` function which generated a DocObject and attaches it to the `root` Dom Object.
```js
var docObj = $(rootElement).DocObject({
    values: {
    },
    elements:{
    },
    binds:{
    },
    render: [
    ],
})
```

To get a better idea of the options passed in lets look at each individual option.

### Elements
The elements option allows you to assign keys to specific jQuery selectors to be re-used within the page. The elements object will correspond the the created DocObjects's `.elements` property. The main difference between the `.elements` property and the default jQuery selector function (`$(...)`) is to reselect for possible changes when an update is made to the root element. This means that the `.elements` property will re-select every time it is accessed. To get a better understanding we can analyze the examples below.
```js
var docObj = $(rootElement).DocObject({
    elements:{
        activeDiv:'div.active' 
    }
    ...other options
})
docObj.elements.activeDiv //Will Return the currently active div
```

The `.elements` property will also select for passed in selectors if a selector is passed in as a key itself.

```js
var docObj = $(rootElement).DocObject({
    elements:{
    }
    ...other options
})
docObj.elements['div.active'] //Will Return the currently active div
```

### Values

The values option will determine the initial value of the `values` object associated with the given DocObject. When a DocObject's value is updated the following process will take place:

1. The DocObject will run all render functions that include dependencies in common with the value change.
2. The DocObject will re-render all binds traversing from the root object down the DOM tree.

```js
values: {
    someValue:1
    anotherValue: {a:1, b:'Two'}
},
```

#### Updating Values
To Update a DocObject's values you must **set the value property itself!**

Will Trigger Binds and Render:

```js
docObj.values.someValue = 2
//or
docObj.values.anotherValue = {...docObj.values.anotherValue, a:3}
```

Will **NOT** Trigger Binds and Render:

```js
docObj.values.anotherValue.a = 3
```
