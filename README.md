# Nine Men's Morris (Mills)

This project has two purposes:
- Being a playable game human vs. machine
- Being a demonstration of the **Model-View-ViewModel** design pattern with a hopefully meaningful use purpose

&nbsp;

### Abstract

In a _Model-View-ViewModel_ (abbreviated **MVVM**) - project, code is strictly separated into different sections:
- The **Model section**, responsible for the logic (not necessarily the so-called _business logic_)
- The **View section**, enabling interaction with the user
- The **ViewModel section**, linking between both by sending and receiving messages

**Model** and **View** do not know each other; they communicate indirectly with the aid of the **ViewModel**.
Compared to other design patterns, **Model** is a little less than a _backend_ (because it must not make its own decisions but has to wait until invoked), and **View** is a little more than a _display section_ (because it may contain its own logic which has to be related to user interaction tasks).     
In this realisation, **ViewModel** represents a guard over the game's rules, deciding which player may continue, which moves are allowed etc.

&nbsp;

## Pros and Cons

Using **MVVM** is always a little more complex than executing subsequent code directly, and the application usually performs a little slower. It requires a higher abstraction level when designing the project.    
On the other hand, it enables to treat different sections separately what might be useful when maintaining or extending the application. To demonstrate this possible advantage, I created three different versions, sharing parts of the other ones:

**[Javascript Browser Version](https://github.com/mentalmove/Mills/tree/master)** and **[Console Version](https://github.com/mentalmove/Mills/tree/Console)** share (almost) the same **Model**, having different **Views**.        
**[PHP Browser Version](https://github.com/mentalmove/Mills/tree/PHP)** and **Javascript Browser Version** share exactly the same **View**, having different **Models**.        
All versions have at least more or less the same **ViewModel** in common.

&nbsp;

### Usage of Javascript Browser Version (branch _master_)

- Download project and execute file _index.html_ in a browser of your choice

**OR**

- Click **[above link](https://mentalmove.github.io/Mills/)**
