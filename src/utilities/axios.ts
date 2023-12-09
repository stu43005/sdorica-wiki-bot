import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, {
	retries: 5,
	retryDelay: axiosRetry.exponentialDelay,
});

export { axios };
