import React, { Component } from "react";
import PropTypes from "prop-types";
import { Text, View } from "react-native";
import { Spinner } from "native-base";

import * as AppConstants from "__src/app/constants";
import styles from "../styles";

class Splash extends Component {
	static navigationOptions = {
		header: null,
	};

	static propTypes = {
		navigation: PropTypes.object,
	};

	componentDidMount() {
		setTimeout(() => {
			this.props.navigation.navigate(AppConstants.LOGIN_SCREEN);
		}, AppConstants.SPLASH_TIMEOUT);
	}

	render() {
		return (
			<View style={styles.container}>
				<Text>Splash Screen</Text>
				<Spinner color="blue" />
			</View>
		);
	}
}

export default Splash;
