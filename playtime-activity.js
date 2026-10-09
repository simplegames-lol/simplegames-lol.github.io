export function eligiblePlaytime({playing,visible,pageActive,overlayOpen,loaded,now,lastActivity,idleLimit=120000}) {
  return !!(playing&&visible&&pageActive&&overlayOpen&&loaded&&now-lastActivity<idleLimit);
}
