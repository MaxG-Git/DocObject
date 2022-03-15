<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="#">
    <img src="https://git.maxg.cloud/max/DocObject/raw/branch/master/img/docobject_logoTextRight.svg" alt="Logo" width="120" height="80">
  </a>

  <h3 align="center">DocObject</h3>

  <p align="center">
    A Lightweight jQuery Plugin to structure page updates
    <br />
  </p>
</div>

<!-- ABOUT -->
## What is DocObject

DocObject is a simple Script/jQuery Plugin that aims to help structure page updates/injections. DocObject is designed to fit into existing websites as well as new projects. DocObject can be used to manage a single element up to an entire document.

DocObject comes with plug-and-play jQuery support but may also be used without jQuery
### Built With

DocObject can be used with jQuery
* [JQuery](https://jquery.com)

<!-- GETTING STARTED -->
## Getting Started

To use DocObject with jQuery must be compiled first. To ensure jQuery uis complied simply add jQuery before including DocObject. DocObject may be used without jQuery. When using DocObjct with jQuery, HTML Elements will be passed as jQuery Object. Without jQuery, DocObject will instead use arrays of DOM Nodes.
```html
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"
        integrity="..." crossorigin="anonymous"></script>
    <!-- DocObject -->
    <script src="/dist/DocObject.bundle.min.js"></script>
```

## Usage
DocObject ships with the global variable `Doc`. The `Doc` variable is how we can access DocObject Functions.
To get started we can first look at the `.obj` function which generates a DocObject and attaches it to the `root` Dom Object.
```js
var docObj = Doc.obj(document.body, {
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

We may achieve the same result by using the `$.DocObject` function added to jQuery by DocObject
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

### Binds

Binds allow for adding custom functionality to HTML elements and is the core for managing DOM updates using DocObject. A Bind's `host tag` will run its designated `bind function` each time it's parent DocObject value is updated and re-render.

Their are currently many ways to define a bind depending on the unique scenario, Although all binds require the following

* A **Bind Function** defined in the `binds` object when instantiating a DocObject.
* A host tag in the desired location of the bind (where to render this bind)

#### Bind Function

 A Bind function is a normal JavaScript function that...

* Takes the following three parameters in their respective order:
  * `values` : The current values of the DocObject
  * `attrs` : A object containing the attributes of the `host tag`
  * `children` : An array of the child nodes within the `host tag` *This can be interpolated into a string and will convert to html automatically*
* Returns **One** the following:
  * An HTML string to be bound to the `host tag`
  * An HTMLElement (DOM) to be bound to the `host tag`
  * A one dimensional array containing HTML strings and/or HTMLElements to be bound **inside** the `host tag` ***Can only be used with the** `d-bind-in` host tag.

In the following snippet we can see the definition of a Bind Function

```js
var docObj = $(rootElement).DocObject({
    binds:{
        helloWorld : (values, attrs, children) => `<div> Hello ${children} World </div>`,
    }
    ...other options
})
```

#### Host Tag

The host tag is an HTML tag that is designated to a bind function. A host tag can be defined in the following three ways:

1. Using the shipped `d-bind` tag and setting a `to` attribute to the respective bind function
2. Using any HTML tag and setting the `d-bind` attribute to the respective bind function
3. Using any HTML tag and setting the `d-bind-in` attribute to the respective bind function

> Unlike `d-bind` host tags which completely replaces the host tag upon render, the `d-bind-in` host tag inserts the bind inside the host tag. 

The following examples shows all three implementations of a host tag:

```html
<!-- 1 (d-bind tag) Binding to helloWorld bind function -->
<d-bind to="helloWorld">
</d-bind>

<!-- 2 (d-bind tag) Binding to helloWorld bind function -->
<span d-bind="helloWorld">
</span>

<!-- 3 (d-bind-in tag) Binding to helloWorld bind function -->
<span d-bind-in="helloWorld">
</span>
```

#### Combining Bind Functions and Host Tags

In the previous example we saw the definition of a host tag and its respective bind function. We can better visualize this by combing the two. In this combined example we will define the bind function outside of the DocObject instantiation and pass it in as a variable.

```html
<body>
    <d-bind to="helloWorld">
        <h1>Beautiful</h1>
    </d-bind>
</body>
<script>
function helloWorld (values, attrs, children) {
    return `<div> Hello ${children} World </div>`;
}

var docObj = $(document.body).DocObject({
    binds:{
        helloWorld
    }
})
</script>
```

Compiles too...

```html
<body>
    <div d-bind="helloWorld">
        Hello <h1>Beautiful</h1> World
    </div>
</body>
```
