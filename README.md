# compiler

```js
let a=1  //es6
var a=1  //es5
```



##### 词法分析 tokenizer

​	生成一个个词素（token）

```js
let a=1
[let,a,=,1]
```

```js
[
  { type: 'Keyword', value: 'let' },
  { type: 'Identifier', value: 'a' },
  { type: 'Punctuator', value: '=' },
  { type: 'Number', value: '1' }
]
```



##### 语法分析 parser

​	根据词素 生成抽象语法树 ，描述源代码各部分之间关系

##### 遍历

##### 转换	

添加 删除 替换属性节点   改变现有的抽象语法树 =》目标抽象语法树

##### 代码生成

