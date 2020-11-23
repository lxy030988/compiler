# compiler

#### 目标

```js
let a=1  //es6
==>
var a=1  //es5
```

#### 编译流程

##### 词法分析 tokenizer

​	生成一个个词素（token） 每一个token表达一个词的特性

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

​	根据词素 生成抽象语法树 ，描述语法结构

```js
{
    type: 'Program',
    body: [
        {
            type: 'VariableDeclaration',
            declarations: [{
                type: 'VariableDeclarator',
                id: {
                    type: 'Identifier',
                    name: a,
                }, // 定义的变量
                init: {
                    type: 'NumberLiteral',
                    value: Number(1),
                    row:1
                } // 赋予的值
            }],
            kind: 'let',
        }
    ],
    sourceType: 'script'//表示是一个脚本
}
```



##### 遍历 traverser + 转换 transformer

添加 删除 替换属性节点   改变现有的抽象语法树 =》目标抽象语法树

```js
{
    type: 'Program',
    body: [
        {
            type: 'VariableDeclaration',
            declarations: [{
                type: 'VariableDeclarator',
                id: {
                    type: 'Identifier',
                    name: a,
                }, // 定义的变量
                init: {
                    type: 'NumberLiteral',
                    value: Number(1),
                    row:1
                } // 赋予的值
            }],
            kind: 'var',
        }
    ],
    sourceType: 'script'//表示是一个脚本
}
```



##### 代码生成 generator

```js
var a=1
```

