import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

import {SpawnInfo, ZepetoPlayers} from 'ZEPETO.Character.Controller'

export default class CharacterControllerSample extends ZepetoScriptBehaviour {

    Start() {

        ZepetoPlayers.instance.CreatePlayerWithZepetoId("ajh322", "ajh322", new SpawnInfo(), true);

        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {

            let _player = ZepetoPlayers.instance.LocalPlayer;

        });

    }

}