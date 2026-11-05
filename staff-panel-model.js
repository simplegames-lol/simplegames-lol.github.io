export function staffCapabilities(uid,access={}){
 const support=uid&&access.support?.uid===uid?access.support:{},polls=uid&&access.polls?.uid===uid?access.polls:{};
 return {full:support.owner===true||support.panel===true,owner:support.owner===true,support:support.owner===true||support.staff===true,polls:support.owner===true||support.panel===true||polls.owner===true||polls.staff===true,pollOwner:polls.owner===true};
}
