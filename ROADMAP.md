YAMVC - change log
=============

##Propositions
* (0.1.13) Model and Template initialization in view should be easier and require less code
* Every of class should contain alias
* It should be possible to add callback which will be fired only once
* `ya.View` shouldn't be responsible for binding and replacing values. All of this should be done in 'ya.view.Template'
* We should be able to add combine listeners using only one `addEventListener` execution, ex.
`addEventListener('render:[button]click')` which should assign click listener to button element after DOM was rendered
