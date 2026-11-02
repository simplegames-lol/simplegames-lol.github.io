export function staffCapabilities(uid,access={}){
 const support=uid&&access.support?.uid===uid?access.support:{},polls=uid&&access.polls?.uid===uid?access.polls:{};
 return {owner:support.owner===true,support:support.owner===true||support.staff===true,polls:polls.owner===true||polls.staff===true,pollOwner:polls.owner===true};
}
