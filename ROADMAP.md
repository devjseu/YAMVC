YAMVC - change log
=============

##Propositions
* It should be possible to add callback which will be fired only once
* We should be able to add combine listeners using only one `addEventListener` execution, ex.
`addEventListener('render:[button]click')` which should assign click listener to button element after DOM was rendered
* When delegating events putting `>` in query will tell dispatcher to look for element pointed by selector after this char
 directly in parent. Ex. `$example > button` should point to all button instances which are defined in $example view
* Class initialization flow should be redesigned I think, methods like `initConfig`, `initRequired` should be changed to
smth like `makeConfig`, `checkRequired` which sounds more clearly.
