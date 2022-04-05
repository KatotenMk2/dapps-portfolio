// constants.js
const CONTRACT_ADDRESS = '0x53cA8353728cEc3B0453791753C61ea17051049b';

//NFT キャラクター の属性をフォーマットしてオブジェクトとして返します。
const transformCharacterData = (characterData) => {
    return {
      name: characterData.name,
      imageURI: characterData.imageURI,
      hp: characterData.hp.toNumber(),
      maxHp: characterData.maxHp.toNumber(),
      attackDamage: characterData.attackDamage.toNumber(),
    };
  };
  
  // 変数を constants.js 以外の場所でも使えるようにします。
  export { CONTRACT_ADDRESS, transformCharacterData };