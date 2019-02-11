import Immutable from 'immutable';
import ActionTypes from '../constants/ActionTypes';

let initialState = Immutable.fromJS({
  messageCount: 0,
  headerMessages: [],
  sideBarMessages: [],
  activeMessage: false,
});

export default function(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.COMMON_MSG_ADD_MSG: {
      const newMsg = Immutable.fromJS([{
        content: action.content,
        messageType: action.messageType,
        id: action.id
      }]);
      const location = action.loc + 'Messages';
      const messageCount = state.get('messageCount') + 1;
      const activeMessage = messageCount > 0  ? true : false;
      const newState = state.update(location, (msgs) => newMsg.concat(msgs))
        .set('messageCount', messageCount)
        .set('activeMessage', activeMessage);

      return newState;
    }

    case ActionTypes.COMMON_MSG_REMOVE_MSG: {
      // get current state of messages
      // operate on the one matching supplied id
      let messageCount = state.get('messageCount');
      const newMessageCount = --messageCount;
      const id = action.id;
      console.log('message count remove: ', messageCount);
      const activeMessage = newMessageCount === 0 ? false : true;
      const newHeaderMsgState = state.get('headerMessages')
        .filter((m) => {
          let mID = m.get('id');

          // Filter exchange messages.
          return mID === 'h' + id;
        });
      const newsideBarMessagestate = state.get('sideBarMessages')
        .filter((m) => {
          let mID = m.get('id');

          // Filter betslip messages.
          return mID === 's' + id;
        });

      return state.set('headerMessages', newHeaderMsgState)
        .set('sideBarMessages', newsideBarMessagestate)
        .set('messageCount', newMessageCount)
        .set('activeMessage', activeMessage);
    }

    case ActionTypes.COMMON_MSG_RESET: {
      return initialState;
    }

    default: {
      return state;
    }
  }
}
