/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';

import { emojiReactionAdd } from '../api';
import { codePointMap } from './codePointMap';
import { Screen } from '../common';
import EmojiRow from './EmojiRow';
import getFilteredEmojiList from './getFilteredEmojiList';
import type { GlobalState, RealmEmojiState, Auth, Dispatch } from '../types';
import { getAuth, getActiveRealmEmojiByName } from '../selectors';
import { navigateBack } from '../nav/navActions';

type Props = {
  activeRealmEmojiByName: RealmEmojiState,
  auth: Auth,
  dispatch: Dispatch,
  navigation: NavigationScreenProp<*> & {
    state: {
      params: {
        messageId: number,
      },
    },
  },
};

type State = {
  filter: string,
};

class EmojiPickerScreen extends PureComponent<Props, State> {
  props: Props;
  state: State;

  state = {
    filter: '',
  };

  handleInputChange = (text: string) => {
    this.setState({
      filter: text.toLowerCase(),
    });
  };

  addReaction = (item: string, activeRealmEmojiByName: RealmEmojiState) => {
    const { auth, dispatch, navigation } = this.props;
    const { messageId } = navigation.state.params;
    if (activeRealmEmojiByName && activeRealmEmojiByName[item]) {
      emojiReactionAdd(auth, messageId, 'realm_emoji', activeRealmEmojiByName[item].id, item);
    } else {
      emojiReactionAdd(auth, messageId, 'unicode_emoji', codePointMap[item], item);
    }
    dispatch(navigateBack());
  };

  render() {
    const { activeRealmEmojiByName } = this.props;
    const { filter } = this.state;

    const emojis = getFilteredEmojiList(filter, activeRealmEmojiByName);

    return (
      <Screen search searchBarOnChange={this.handleInputChange}>
        <FlatList
          keyboardShouldPersistTaps="always"
          initialNumToRender={20}
          data={emojis}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <EmojiRow
              realmEmoji={activeRealmEmojiByName[item]}
              name={item}
              onPress={() => {
                this.addReaction(item, activeRealmEmojiByName);
              }}
            />
          )}
        />
      </Screen>
    );
  }
}

export default connect((state: GlobalState) => ({
  activeRealmEmojiByName: getActiveRealmEmojiByName(state),
  auth: getAuth(state),
}))(EmojiPickerScreen);
