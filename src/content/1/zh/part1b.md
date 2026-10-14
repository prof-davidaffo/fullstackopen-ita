---
mainImage: ../../../images/part-1.svg
part: 1
letter: b
lang: zh
---

<div class="content">

<!-- During the course, we have a goal and a need to learn a sufficient amount of JavaScript in addition to web development.-->
在课程中，除了网络开发，我们还有一个目标和需求，就是学习足够多的JavaScript。

<!-- JavaScript has advanced rapidly in the last few years and in this course, we use features from the newer versions. The official name of the JavaScript standard is [ECMAScript](https://en.wikipedia.org/wiki/ECMAScript). At this moment, the latest version is the one released in June of 2024 with the name [ECMAScript®2024](https://www.ecma-international.org/ecma-262/), otherwise known as ES15. -->
JavaScript在过去的几年里进步很快，在本课程中，我们使用了较新版本的功能。JavaScript标准的官方名称是[ECMAScript](https://en.wikipedia.org/wiki/ECMAScript)。目前，最新的版本是2024年6月发布的版本，叫[ECMAScript®2024](https://www.ecma-international.org/ecma-262/)，又叫ES15。

<!-- Browsers do not yet support all of JavaScript's newest features. Due to this fact, a lot of code run in browsers has been <i>transpiled</i> from a newer version of JavaScript to an older, more compatible version.-->
浏览器还不支持JavaScript的所有最新功能。由于这个事实，很多在浏览器中运行的代码都是从较新版本的JavaScript<i>转译</i>成较旧的、更兼容的版本。

<!-- Today, the most popular way to do transpiling is by using [Babel](https://babeljs.io/). Transpilation is automatically configured in React applications created with Vite. We will take a closer look at the configuration of the transpilation in [part 7](/en/part7) of this course. -->
如今，最流行的转译方式是通过[Babel](https://babeljs.io/)。在用Vite创建的React应用中，转译是自动配置的。我们将在本课程的[第7章节](/zh/part7)中仔细研究转译的配置问题。

<!-- [Node.js](https://nodejs.org/en/) is a JavaScript runtime environment based on Google's [Chrome V8](https://developers.google.com/v8/) JavaScript engine and works practically anywhere - from servers to mobile phones. Let's practice writing some JavaScript using Node. The latest versions of Node already understand the latest versions of JavaScript, so the code does not need to be transpiled. -->
[Node.js](https://nodejs.org/en/)是一个基于Google的[Chrome V8](https://developers.google.com/v8/) JavaScript引擎的JavaScript运行环境，几乎可以在任何地方运行——从服务器到手机应用。让我们练习一下使用Node编写一些JavaScript。最新版本的Node已经能够理解最新版本的JavaScript，所以代码不需要转译。

<!-- The code is written into files ending with <i>.js</i> that are run by issuing the command <em>node name\_of\_file.js</em>-->
代码被写入以<i>.js</i>结尾的文件中，通过键入<em>node name\_of\_file.js</em>命令来运行。

<!-- It is also possible to write JavaScript code into the Node.js console, which is opened by typing _node_ in the command-line, as well as into the browser's developer tool console. [The newest revisions of Chrome handle the newer features of JavaScript pretty well](https://compat-table.github.io/compat-table/es2016plus/) without transpiling the code. Alternatively you can use a tool like [JS Bin](https://jsbin.com/?js,console).-->
也可以将JavaScript代码写入Node.js控制台，该控制台可以通过在命令行中输入_node_打开，也可以写入浏览器的开发者工具控制台。[Chrome浏览器的最新版本可以很好地处理JavaScript的新功能](https://compat-table.github.io/compat-table/es2016plus/)，无需转译。另外，你可以使用[JS Bin](https://jsbin.com/?js,console)这样的工具。

<!-- JavaScript is sort of reminiscent, both in name and syntax, to Java. But when it comes to the core mechanism of the language they could not be more different. Coming from a Java background, the behavior of JavaScript can seem a bit alien, especially if one does not make the effort to look up its features.-->
JavaScript在名字和语法上都有点让人想到Java。但是在语言的核心机制上，它们是非常不同的。对于学习过Java的人，尤其是那些没有花时间去研究的JavaScript特性的人，可能会对JavaScript的行为感到有点陌生。

<!-- In certain circles it has also been popular to attempt "simulating" Java features and design patterns in JavaScript. We do not recommend doing this as the languages and respective ecosystems are ultimately very different.-->
在某些圈子里，还流行尝试用JavaScript“模拟”Java的特性和设计模式。我们不建议这样做，因为这两种语言和各自的生态系统最终都是非常不同的。

<!-- ### Variables -->
### 变量

<!-- In JavaScript there are a few ways to go about defining variables:-->
在JavaScript中，有几种方法来定义变量：

```js
const x = 1
let y = 5

console.log(x, y)   // 1 5 are printed
y += 10
console.log(x, y)   // 1 15 are printed
y = 'sometext'
console.log(x, y)   // 1 sometext are printed
x = 4               // causes an error
```

<!-- [const](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const) does not actually define a variable but a <i>constant</i> for which the value can no longer be changed. On the other hand [let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let) defines a normal variable.-->
[const](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)实际上并没有定义一个变量，而是一个<i>常量</i>，其值不能再被改变。相对应的，[let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)定义了一个普通变量。

<!-- In the example above, we also see that the type of the data assigned to the variable can change during execution. At the start _y_ stores an integer and at the end a string.-->
在上面的例子中，我们还看到分配给变量的数据类型在执行过程中可以改变。在开始时_y_存储的是一个整数，在结束时是一个字符串。

<!-- It is also possible to define variables in JavaScript using the keyword [var](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var). var was, for a long time, the only way to define variables. const and let were only recently added in version ES6. In specific situations, var works in a different way compared to variable definitions in most languages - see [JavaScript Variables - Should You Use let, var or const? on Medium](https://medium.com/craft-academy/javascript-variables-should-you-use-let-var-or-const-394f7645c88f) or [Keyword: var vs. let on JS Tips](http://www.jstips.co/en/javascript/keyword-var-vs-let/) for more information. During this course the use of var is ill-advised and you should stick with using const and let!-->
在JavaScript中也可以使用关键字[var](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var)来定义变量。在很长一段时间内，var是定义变量的唯一方法。 const和let是在2015年的ES6版本中引入的。在特定情况下，与大多数语言中的变量定义相比，var的运行方式有所不同——更多信息请参见[Medium上的JavaScript Variables - Should You Use let, var or const?](https://medium.com/craft-academy/javascript-variables-should-you-use-let-var-or-const-394f7645c88f)或[JS Tips上的Keyword: var vs. let](http://www.jstips.co/en/javascript/keyword-var-vs-let/) 。在本课程中，使用var是不明智的，你应该坚持使用const和let！
<!-- You can find more on this topic on YouTube - e.g. [var, let and const - ES6 JavaScript Features](https://youtu.be/sjyJBL5fkp8)-->
你可以在YouTube上找到更多关于这个主题的信息——例如 [var, let and const - ES6 JavaScript Features](https://youtu.be/sjyJBL5fkp8)

<!-- ### Arrays -->
### 数组

<!-- An [array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) and a couple of examples of its use:-->
一个[数组](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)和几个使用它的例子：

```js
const t = [1, -1, 3]

t.push(5)

console.log(t.length) // 4 is printed
console.log(t[1])     // -1 is printed

t.forEach(value => {
  console.log(value)  // numbers 1, -1, 3, 5 are printed, each to own line
})
```

<!-- Notable in this example is the fact that although a variable declared with const cannot be reassigned to a different value, the contents of the object it references can still be modified. This is because the const declaration ensures the immutability of the reference itself, not the data it points to. Think of it like changing the furniture inside a house, while the address of the house remains the same. -->
需要注意的是在这个例子中，虽然用const声明的变量不可以再被重新赋值，但是对象引用的内容依然可以更改。这是因为const声明保证的是引用地址的不变性，而非引用数据的不变性。这就好比改变房子里的家具的时候，房子的地址还是一样的。

<!-- One way of iterating through the items of the array is using _forEach_ as seen in the example. _forEach_ receives a <i>function</i> defined using the arrow syntax as a parameter.-->
遍历数组项目的一种方法是使用_forEach_，如示例中所示。_forEach_接收一个用箭头语法定义的<i>函数</i>作为参数。

```js
value => {
  console.log(value)
}
```

<!-- forEach calls the function <i>for each of the items in the array</i>, always passing the individual item as an argument. The function as the argument of forEach may also receive [other arguments](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach).-->
forEach为<i>数组中的每一项</i>调用函数，总是传递单个项作为参数。作为forEach参数的函数也可以接收[其他参数](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)。

<!-- In the previous example, a new item was added to the array using the method [push](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push). When using React, techniques from functional programming are often used. One characteristic of the functional programming paradigm is the use of [immutable](https://en.wikipedia.org/wiki/Immutable_object) data structures. In React code, it is preferable to use the method [concat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat), which creates a new array with the added item. This ensures the original array remains unchanged. -->
在前面的例子中，使用方法[push](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push)将一个新项添加到数组中。在使用React时，经常使用函数式编程的方法。函数式编程范式的一个特点是使用[不可变的](https://en.wikipedia.org/wiki/Immutable_object)数据结构。在React代码中，最好使用[concat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat)方法，该方法会创建一个包含新项的新数组。这样可以保证原始数组保持不变。

```js
const t = [1, -1, 3]

const t2 = t.concat(5)

console.log(t)  // [1, -1, 3] is printed
console.log(t2) // [1, -1, 3, 5] is printed
```

<!-- The method call _t.concat(5)_ does not add a new item to the old array but returns a new array which, besides containing the items of the old array, also contains the new item.-->
方法调用_t.concat(5)_并没有向旧数组添加一个新的项，而是返回一个新的数组，这个数组除了包含旧数组的项之外，还包含新的项。

<!-- There are plenty of useful methods defined for arrays. Let's look at a short example of using the [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) method.-->
数组定义了很多有用的方法。让我们看看一个使用[map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)方法的简短例子。

```js
const t = [1, 2, 3]

const m1 = t.map(value => value * 2)
console.log(m1)   // [2, 4, 6] is printed
```

<!-- Based on the old array, map creates a <i>new array</i>, for which the function given as a parameter is used to create the items. In the case of this example the original value is multiplied by two.-->
map基于旧数组创建了一个<i>新数组</i>，这个数组使用作为参数的函数来创建每一项。在这个例子中，是将原始值乘以2。

<!-- Map can also transform the array into something completely different:-->
map也可以将数组转化为完全不同的东西：

```js
const m2 = t.map(value => '<li>' + value + '</li>')
console.log(m2)
// [ '<li>1</li>', '<li>2</li>', '<li>3</li>' ] is printed
```

<!-- Here an array filled with integer values is transformed into an array containing strings of HTML using the map method. In [part 2](/en/part2) of this course, we will see that map is used quite frequently in React.-->
这里通过map方法将一个充满整数值的数组转化为一个包含HTML字符串的数组。在本课程的[第2章节](/zh/part2)中，我们看到map在React中的使用得相当频繁。

<!-- Individual items of an array are easy to assign to variables with the help of the [destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment).-->
在[解构赋值](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)的帮助下，很容易将数组中的每个项目赋值给变量。

```js
const t = [1, 2, 3, 4, 5]

const [first, second, ...rest] = t

console.log(first, second)  // 1 2 is printed
console.log(rest)          // [3, 4, 5] is printed
```

<!-- Above, the variable _first_ is assigned the first integer of the array and the variable _second_ is assigned the second integer of the array. The variable _rest_ "collects" the remaining integers into its own array. -->
上面，数组的第一个整数赋值给了变量_first_，数组的第二个整数赋值给了变量_second_。变量_rest_“收集”其余的整数到自己的数组中。

<!-- ### Objects -->
### 对象

<!-- There are a few different ways of defining objects in JavaScript. One very common method is using [object literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#Object_literals), which happens by listing its properties within braces:-->
在JavaScript中，有多种不同的方法来定义对象。一种非常常见的方法是使用[对象字面量](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#Object_literals)，也就是在大括号内列出其属性：

```js
const object1 = {
  name: 'Arto Hellas',
  age: 35,
  education: 'PhD',
}

const object2 = {
  name: 'Full Stack web application development',
  level: 'intermediate studies',
  size: 5,
}

const object3 = {
  name: {
    first: 'Dan',
    last: 'Abramov',
  },
  grades: [2, 3, 5, 3],
  department: 'Stanford University',
}
```

<!-- The values of the properties can be of any type, like integers, strings, arrays, objects...-->
属性的值可以是任何类型的，比如整数、字符串、数组、对象……

<!-- The properties of an object are referenced by using the "dot" notation, or by using brackets:-->
一个对象的属性是通过“点”号或中括号来引用的：

```js
console.log(object1.name)         // Arto Hellas is printed
const fieldName = 'age'
console.log(object1[fieldName])    // 35 is printed
```

<!-- You can also add properties to an object on the fly by either using dot notation or brackets:-->
你也可以通过使用点号或中括号来为一个对象即时添加属性：

```js
object1.address = 'Helsinki'
object1['secret number'] = 12341
```

<!-- The latter of the additions has to be done by using brackets, because when using dot notation, <i>secret number</i> is not a valid property name because of the space character.-->
后一种添加必须使用中括号，因为当使用点号时，由于有空格字符，<i>secret number</i>不是一个有效的属性名称。

<!-- Naturally, objects in JavaScript can also have methods. However, during this course we do not need to define any objects with methods of their own. This is why they are only discussed briefly during the course.-->
自然地，JavaScript中的对象也可以有方法。然而在本课程中，我们不需要定义任何有自己方法的对象。这就是为什么在本课程中只简单地讨论它们。

<!-- Objects can also be defined using so-called constructor functions, which results in a mechanism reminiscent of many other programming languages, e.g. Java's classes. Despite this similarity, JavaScript does not have classes in the same sense as object-oriented programming languages. There has been, however, an addition of the <i>class syntax</i> starting from version ES6, which in some cases helps structure object-oriented classes.-->
对象也可以用所谓的构造函数来定义，这一机制让人想起许多其他编程语言，例如Java的类。尽管有这种相似性，JavaScript并没有与面向对象的编程语言一样的类。然而，从ES6版本开始，增加了<i>class语法</i>，这在某些情况下有助于构造面向对象的类。

<!-- ### Functions -->
### 函数

<!-- We have already become familiar with defining arrow functions. The complete process, without cutting corners, to defining an arrow function is as follows:-->
我们已经熟悉了定义箭头函数的方法。在不走弯路的情况下，定义一个箭头函数的完整过程如下：

```js
const sum = (p1, p2) => {
  console.log(p1)
  console.log(p2)
  return p1 + p2
}
```

<!-- and the function is called as can be expected:-->
函数的调用和预期的一样：

```js
const result = sum(1, 5)
console.log(result)
```

<!-- If there is just a single parameter, we can exclude the parentheses from the definition:-->
如果只有一个参数，我们可以在定义中排除括号。

```js
const square = p => {
  console.log(p)
  return p * p
}
```

<!-- If the function only contains a single expression then the braces are not needed. In this case the function only returns the result of its only expression. Now, if we remove console printing, we can further shorten the function definition:-->
如果函数只包含一个表达式，那么大括号就不需要了。在这种情况下，函数只返回其唯一表达式的结果。现在，如果我们去掉控制台打印，我们可以进一步简化函数定义：

```js
const square = p => p * p
```

<!-- This form is particularly handy when manipulating arrays - e.g. when using the map method:-->
这种形式在操作数组时特别方便——例如使用map方法时：

```js
const t = [1, 2, 3]
const tSquared = t.map(p => p * p)
// tSquared is now [1, 4, 9]
```

<!-- The arrow function feature was added to JavaScript in 2015, with version [ES6](https://rse.github.io/es6-features/). Before this, the only way to define functions was by using the keyword _function_. -->
箭头函数的功能是在2015年的[ES6](https://rse.github.io/es6-features/)版本才加入到JavaScript中的。在这之前，定义函数的唯一方法是使用关键字_function_。

<!-- There are two ways to reference the function; one is giving a name in a [function declaration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function).-->
有两种方式来引用函数；一种是在[函数声明](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)中给出一个名称。

```js
function product(a, b) {
  return a * b
}

const result = product(2, 6)
// result is now 12
```

<!-- The other way to define the function is using a [function expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function). In this case there is no need to give the function a name and the definition may reside among the rest of the code:-->
另一种定义函数的方式是使用[函数表达式](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function)。在这种情况下，不需要给函数一个名字，定义可以存在于代码的其他部分：

```js
const average = function(a, b) {
  return (a + b) / 2
}

const result = average(2, 5)
// result is now 3.5
```

<!-- During this course we will define all functions using the arrow syntax.-->
在本课程中，所有函数都使用箭头语法定义。

</div>

<div class="tasks">
<!--   <h3>Exercises 1.3.-1.5.</h3>-->
 <h3>练习1.3.~1.5.</h3> 

<!-- **Pro-tip:** you may run into issues when it comes to the structure of the <i>props</i> that components receive. A good way to make things more clear is by printing the props to the console, e.g. as follows:-->
**建议：**当涉及到组件接收的<i>props</i>的结构时，你可能会遇到问题。一个让事情更明确的好方法是把props打印到控制台，例如：

```js
const Header = (props) => {
  console.log(props) // highlight-line
  return <h1>{props.course}</h1>
}
```

<!-- If and <i>when</i> you encounter an error message -->
<i>每当</i>你遇到报错信息

> <i>Objects are not valid as a React child</i>

<!-- keep in mind the things told [here](/en/part1/introduction_to_react#do-not-render-objects). -->
记住[这里](/zh/part1/react简介#不要渲染对象)提到的内容。

  <!-- <h4>1.3: Course Information step 3</h4> -->
  <h4>1.3：课程信息 第3步</h4>

<!-- Let's move forward to using objects in our application. Modify the variable definitions of the <i>App</i> component as follows and also refactor the application so that it still works: -->
让我们开始在我们的应用中使用对象。修改<i>App</i>组件的变量定义如下，同时重构应用，使其仍能运行：

```js
const App = () => {
  const course = 'Half Stack application development'
  const part1 = {
    name: 'Fundamentals of React',
    exercises: 10
  }
  const part2 = {
    name: 'Using props to pass data',
    exercises: 7
  }
  const part3 = {
    name: 'State of a component',
    exercises: 14
  }

  return (
    <div>
      ...
    </div>
  )
}
```

  <!-- <h4>1.4: Course Information step 4</h4> -->
  <h4>1.4：课程信息 第4步</h4>

<!-- Place the objects into an array. Modify the variable definitions of <i>App</i> into the following form and modify the other parts of the application accordingly: -->
然后将对象放入一个数组。将<i>App</i>的变量定义修改为以下形式，并相应地修改应用的其他部分：

```js
const App = () => {
  const course = 'Half Stack application development'
  const parts = [
    {
      name: 'Fundamentals of React',
      exercises: 10
    },
    {
      name: 'Using props to pass data',
      exercises: 7
    },
    {
      name: 'State of a component',
      exercises: 14
    }
  ]

  return (
    <div>
      ...
    </div>
  )
}
```

<!-- **NB** at this point <i>you can assume that there are always three items</i>, so there is no need to go through the arrays using loops. We will come back to the topic of rendering components based on items in arrays with a more thorough exploration in the [next part of the course](../part2).-->
**注意**当前<i>你可以假设总是有三个项目</i>，所以没有必要用循环来遍历数组。我们将在[课程的下一章节](../part2)中以更深入的探索来回到基于数组中的项目来渲染组件的话题。

<!-- However, do not pass different objects as separate props from the <i>App</i> component to the components <i>Content</i> and <i>Total</i>. Instead, pass them directly as an array:-->
然而，不要把不同的对象作为多个props从<i>App</i>组件传递给<i>Content</i>和<i>Total</i>组件，而是直接将它们作为一个数组传递：

```js
const App = () => {
  // const definitions

  return (
    <div>
      <Header course={course} />
      <Content parts={parts} />
      <Total parts={parts} />
    </div>
  )
}
```

  <!-- <h4>1.5: Course Information step 5</h4> -->
  <h4>1.5: 课程信息 第5步</h4>
<!-- Let's take the changes one step further. Change the course and its parts into a single JavaScript object. Fix everything that breaks.-->
让我们再进一步改变。把课程和它的部分改成单个JavaScript对象。修复所有无法运行的地方。

```js
const App = () => {
  const course = {
    name: 'Half Stack application development',
    parts: [
      {
        name: 'Fundamentals of React',
        exercises: 10
      },
      {
        name: 'Using props to pass data',
        exercises: 7
      },
      {
        name: 'State of a component',
        exercises: 14
      }
    ]
  }

  return (
    <div>
      ...
    </div>
  )
}
```

</div>

<div class="content">

<!-- ### Object methods and "this" -->
### 对象方法和“this”

<!-- Because this course uses a version of React containing React Hooks we do not need to define objects with methods. **The contents of this chapter are not relevant to the course** but are certainly in many ways good to know. In particular, when using older versions of React one must understand the topics of this chapter. -->
由于本课程使用的是包含React Hooks的React版本，我们无需定义带方法的对象。**这一章的内容与本课程无关**，但在很多方面肯定是值得了解的。特别是在使用旧版本的React时，必须了解本章的主题。

<!-- Arrow functions and functions defined using the _function_ keyword vary substantially when it comes to how they behave with respect to the keyword [this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this), which refers to the object itself.-->
箭头函数和使用_function_关键字定义的函数，在对关键字[this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)，即对象本身的行为方式上有很大不同。

<!-- We can assign methods to an object by defining properties that are functions:-->
我们可以通过定义函数类型的属性来将方法赋值给对象：

```js
const arto = {
  name: 'Arto Hellas',
  age: 35,
  education: 'PhD',
  // highlight-start
  greet: function() {
    console.log('hello, my name is ' + this.name)
  },
  // highlight-end
}

arto.greet()  // "hello, my name is Arto Hellas" gets printed
```

<!-- Methods can be assigned to objects even after the creation of the object:-->
即使在对象创建之后，也可以将方法赋值给对象：

```js
const arto = {
  name: 'Arto Hellas',
  age: 35,
  education: 'PhD',
  greet: function() {
    console.log('hello, my name is ' + this.name)
  },
}

// highlight-start
arto.growOlder = function() {
  this.age += 1
}
// highlight-end

console.log(arto.age)   // 35 is printed
arto.growOlder()
console.log(arto.age)   // 36 is printed
```

<!-- Let's slightly modify the object:-->
让我们稍微修改一下对象：

```js
const arto = {
  name: 'Arto Hellas',
  age: 35,
  education: 'PhD',
  greet: function() {
    console.log('hello, my name is ' + this.name)
  },
  // highlight-start
  doAddition: function(a, b) {
    console.log(a + b)
  },
  // highlight-end
}

arto.doAddition(1, 4)        // 5 is printed

const referenceToAddition = arto.doAddition
referenceToAddition(10, 15)   // 25 is printed
```

<!-- Now the object has the method _doAddition_ which calculates the sum of numbers given to it as parameters. The method is called in the usual way, using the object <em>arto.doAddition(1, 4)</em> or by storing a <i>method reference</i> in a variable and calling the method through the variable: <em>referenceToAddition(10, 15)</em>.-->
现在这个对象有一个方法_doAddition_计算给它的参数的数字之和。该方法的调用方式和平常一样，使用对象<em>arto.doAddition(1, 4)</em>，或者将<i>方法引用</i>存储到变量中，然后通过该变量调用该方法：<em>referenceToAddition(10, 15)</em>。

<!-- If we try to do the same with the method _greet_ we run into an issue:-->
如果我们试图对方法_greet_做同样的事情，我们会遇到一个问题。

```js
arto.greet()       // "hello, my name is Arto Hellas" gets printed

const referenceToGreet = arto.greet
referenceToGreet() // prints "hello, my name is undefined"
```

<!-- When calling the method through a reference, the method loses knowledge of what the original _this_ was. Contrary to other languages, in JavaScript the value of [this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) is defined based on <i>how the method is called</i>. When calling the method through a reference the value of _this_ becomes the so-called [global object](https://developer.mozilla.org/en-US/docs/Glossary/Global_object) and the end result is often not what the software developer had originally intended.-->
当通过引用调用方法时，该方法失去了对原始_this_的引用。与其他语言相反，在JavaScript中，[this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)的值是根据<i>方法的调用方式</i>定义的。当通过引用调用方法时，_this_的值就变成了所谓的[全局对象](https://developer.mozilla.org/en-US/docs/Glossary/Global_object)，最终的结果往往不是开发者最初的意图。

<!-- Losing track of _this_ when writing JavaScript code brings forth a few potential issues. Situations often arise where React or Node (or more specifically the JavaScript engine of the web browser) needs to call some method in an object that the developer has defined. However, in this course we avoid these issues by using the "this-less" JavaScript.-->
编写JavaScript代码时丢掉对_this_的跟踪带来了一些潜在的问题。当React或Node（或者更确切地说，网络浏览器的JavaScript引擎）需要调用开发者定义的对象中的某些方法时经常会出现这样的情况。然而，在本课程中，我们通过使用“无this”的JavaScript来避免这些问题。

<!-- One situation leading to the "disappearance" of _this_ arises when we set a timeout to call the _greet_ function on the _arto_ object, using the [setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout) function.-->
当我们使用[setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout)函数设置超时来调用_arto_对象上的_greet_函数时，就会出现_this_“消失”的情况。

```js
const arto = {
  name: 'Arto Hellas',
  greet: function() {
    console.log('hello, my name is ' + this.name)
  },
}

setTimeout(arto.greet, 1000)  // highlight-line
```

<!-- As mentioned, the value of _this_ in JavaScript is defined based on how the method is being called. When <em>setTimeout</em> is calling the method, it is the JavaScript engine that actually calls the method and, at that point, _this_ refers to the global object.-->
如前所述，JavaScript中_this_的值是根据方法被调用的方式来定义的。当<em>setTimeout</em>在调用方法时，是JavaScript引擎在实际调用方法，此时，_this_是指全局对象。

<!-- There are several mechanisms by which the original _this_ can be preserved. One of these is using a method called [bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind):-->
有几种机制可以保留原来的_this_。其中之一是使用方法[bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)。

```js
setTimeout(arto.greet.bind(arto), 1000)
```

<!-- Calling <em>arto.greet.bind(arto)</em> creates a new function where _this_ is bound to point to Arto, independent of where and how the method is being called.-->
调用<em>arto.greet.bind(arto)</em>创建一个新的函数，其中_this_被绑定为指向Arto，与调用该方法的地点和方式无关。

<!-- Using [arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) it is possible to solve some of the problems related to _this_. They should not, however, be used as methods for objects because then _this_ does not work at all. We will come back later to the behavior of _this_ in relation to arrow functions.-->
使用[箭头函数](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)可以解决一些与_this_有关的问题。然而，它们不应该被用作对象的方法，因为那样的话_this_就完全不起作用了。我们稍后会回到_this_与箭头函数相关的行为上。

<!-- If you want to gain a better understanding of how _this_ works in JavaScript, the Internet is full of material about the topic, e.g. the screencast series [Understand JavaScript's this Keyword in Depth](https://egghead.io/courses/understand-javascript-s-this-keyword-in-depth) by [egghead.io](https://egghead.io) is highly recommended!-->
如果你想更好地了解_this_在JavaScript中是如何运行的，互联网上有很多关于这个主题的资料，例如，强烈推荐[egghead.io](https://egghead.io)的截屏系列[Understand JavaScript's this Keyword in Depth](https://egghead.io/courses/understand-javascript-s-this-keyword-in-depth)！

<!-- ### Classes -->
### 类

<!-- As mentioned previously, there is no class mechanism in JavaScript like the ones in object-oriented programming languages. There are, however, features to make "simulating" object-oriented [classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) possible.-->
如前所述，在JavaScript中没有像面向对象编程语言中的类机制。然而，有一些功能可以“模拟”面向对象的[类](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)。

<!-- Let's take a quick look at the <i>class syntax</i> that was introduced into JavaScript with ES6, which substantially simplifies the definition of classes (or class-like things) in JavaScript.-->
让我们快速浏览一下ES6引入JavaScript的<i>类语法</i>，它大大简化了JavaScript中类（或类似类的东西）的定义。

<!-- In the following example we define a "class" called Person and two Person objects:-->
在下面的例子中，我们定义了一个名为Person的 “类”和两个Person对象。

```js
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }
  greet() {
    console.log('hello, my name is ' + this.name)
  }
}

const adam = new Person('Adam Ondra', 35)
adam.greet()

const janja = new Person('Janja Garnbret', 22)
janja.greet()
```

<!-- When it comes to syntax, JavaScript classes and the instances created from them are very reminiscent of how classes and objects work in Java. Their behavior is also quite similar to Java objects. At their core, however, they are still plain JavaScript objects built on [prototypal inheritance](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Inheritance). The type of any such class instance is still _Object_, because JavaScript fundamentally defines only a limited set of types: [Boolean, Null, Undefined, Number, String, Symbol, BigInt, and Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures). -->
在语法上，JavaScrip的类及其创建的对象很容易让人联想到Java的类和对象。JavaScript的类及其创建的对象的行为也与Java的类和对象对象相当相似。但JavaScript类创建的对象的内核仍然是基于[原型继承](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Inheritance)的普通的JavaScript对象。任何类的对象实际上都是_Object_，因为JavaScript定义的类型只有[Boolean、Null、Undefined、Number、String、Symbol、BigInt和Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures)。

<!-- The introduction of the class syntax was a controversial addition. Check out [Not Awesome: ES6 Classes](https://github.com/petsel/not-awesome-es6-classes) or [Is “Class” In ES6 The New “Bad” Part? on Medium](https://medium.com/@rajaraodv/is-class-in-es6-the-new-bad-part-6c4e6fe1ee65) for more details.-->
类语法的引入是有争议的。请查看[Not Awesome: ES6 Classes](https://github.com/petsel/not-awesome-es6-classes)或[Medium上的Is "Class" In ES6 The New "Bad" Part?](https://medium.com/@rajaraodv/is-class-in-es6-the-new-bad-part-6c4e6fe1ee65)了解更多细节。

<!-- The ES6 class syntax is used a lot in "old" React and also in Node.js, hence an understanding of it is beneficial even in this course. However, since we are using the new [Hooks](https://react.dev/reference/react/hooks) feature of React throughout this course, we have no concrete use for JavaScript's class syntax.-->
ES6类的语法在“老”React和Node.js中用得很多，因此即使在这个课程中，对它的理解也是有益的。然而，由于我们在整个课程中使用React的新[Hook](https://react.dev/reference/react/hooks)功能，我们对JavaScript的类语法没有具体的使用。

<!-- ### JavaScript materials -->
### JavaScript资料

<!-- There exist both good and poor guides for JavaScript on the Internet. Most of the links on this page relating to JavaScript features reference [Mozilla's JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript).-->
互联网上的JavaScript指南良莠不齐。本页面中大多数与JavaScript特性有关的链接都参考了[Mozilla的JavaScript指南](https://developer.mozilla.org/en-US/docs/Web/JavaScript)。

<!-- It is highly recommended to immediately read [A re-introduction to JavaScript (JS tutorial)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript) on Mozilla's website.-->
强烈建议立即阅读Mozilla网站上的[JavaScript语言概览](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript)。

<!-- If you wish to get to know JavaScript deeply there is a great free book series on the Internet called [You-Dont-Know-JS](https://github.com/getify/You-Dont-Know-JS).-->
如果你想深入了解JavaScript，网上有个很棒的免费丛书，叫做[You-Dont-Know-JS](https://github.com/getify/You-Dont-Know-JS)。

<!-- Another great resource for learning JavaScript is [javascript.info](https://javascript.info).-->
另一个学习JavaScript的好资源是[javascript.info](https://javascript.info)。

<!-- The free and highly engaging book [Eloquent JavaScript](https://eloquentjavascript.net) takes you from the basics to interesting stuff quickly. It is a mixture of theory projects and exercises and covers general programming theory as well as the JavaScript language. -->
[Eloquent JavaScript](https://eloquentjavascript.net)既免费又引人入胜，它能够帮助你快速从基础入门到深入学习。这本书结合了理论、项目和练习，既涵盖了通用编程理论，也介绍了JavaScript语言本身。

<!-- [Namaste 🙏 JavaScript](https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUccPVNP) is another great and highly recommended free JavaScript tutorial in order to understand how JS works under the hood. Namaste JavaScript is a pure in-depth JavaScript course released for free on YouTube. It will cover the core concepts of JavaScript in detail and everything about how JS works behind the scenes inside the JavaScript engine. -->
[Namaste 🙏 JavaScript](https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUccPVNP)是另一个非常棒且强烈推荐的免费JavaScript教程，可以帮助你理解JS的底层原理。Namaste JavaScript是一个纯深入的JavaScript课程，在YouTube上可以免费观看。它详细讲解了JavaScript的核心概念以及JS在JavaScript引擎内部的运行机制。

<!-- [egghead.io](https://egghead.io) has plenty of quality screencasts on JavaScript, React, and other interesting topics. Unfortunately, some of the material is behind a paywall.-->
[egghead.io](https://egghead.io)有大量关于JavaScript、React和其他有趣话题的高质量截屏。不幸的是，有些资料需要付费。

</div>
