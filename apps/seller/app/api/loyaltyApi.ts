import { store } from "expo-router/build/global-state/router-store";
import { LoyaltyReportData, ProductLoyaltySetting } from "../types/LoyaltyTypes"; 
import api from "./defaultApi"; 

const MOCK_PRODUCTS_LOYALTY_DB: ProductLoyaltySetting[] = [
  { id: 101, name: "Proizvod Lojalnosti 1", currentPointRateFactor: 1, imageUrl: "https://bazaar-backend-storage.s3.eu-north-1.amazonaws.com/2e03ade7-ae40-43c3-a3ba-9f564af82d13.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA4CYEGBQZUUB3PBHT%2F20250523%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Date=20250523T175348Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDoaCmV1LW5vcnRoLTEiRzBFAiAsKQ88Y9tlifXoX4XwyVHpFjY2YqurilA%2BR6KiM8W9agIhAPXS22zSZPbw2YUFi8gS0Ngkx9g1K3iUAspnSQh9P%2BSbKuMCCPP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMODMwNTQ4MDg1ODExIgy6lceqWjQ6a2K%2Fp8kqtwKv5C7HqzDgaIqcSiVyqMNTGUz%2FowIl2AxpmMS6vIV%2BDGUM%2BK1mGAMKOvrOq2ReuRryinWc6s2kCJZt1MOVncEgDacCBPIB5NG8ifTMwbXFhbLS%2BgJsC4eHbYPU6PajTTzxEdSF8s1t0EvJUkd7CurdS6ugrpLQf7vjqXJZxR0E%2BQ6SlCtE1s8nMsjelPFWI64o%2BJk%2F4QpeK3Cmw8CYRDej9iWNjX8Pprg9xEF5TSJGUG2E%2FPTxLmCf9zFE89wAxi8HIs4eErCZwaQjEJnX2PqUA7Yax27OF15mv3grbEYwGi1341uo4pEk7El8DhHgCbC8JSr2k1WKqdKiUhiZZ6wsjUq13z862kPJjDnGwc1262842G13pj%2BIgQFk1VGVOercAQA6gnVlLs3F1dLmCPHpUAsGa8Q3NzCP7MLBBjqtAgiltKdTqTxFcrRUZx1QtjHHXjQ60lwpIjlJXGXr4%2BDBwv3IHlMEsFCI9Ol%2BiXbIj9MDTLTfK5wAx6j1yaVHTcLRTsZmjLHgMvlIVYZ1AzTIM%2BhI%2BwSvy9pOqf17uP1FJ6CkqyDiotnl%2Fy47NbHnFhTwjEZ9FXTk95fZah0pEipDl6EZmNMv%2BzCFxfFGZb5J0FJywTldxo8gMY11cyqvb3htjHgtvfI3NlG%2FLOvfJied2Z95OCr0fCTunXBGDGFZSGn4dOe%2BLXUuVsHoypNe1L%2Bi1b0UyVEvJEVpnmOOUl0DsfVHHomwCYRCJP1qGenK8I7OKmZ3mdGNc2af%2BeQqqFgk%2FZiCgV%2BDdjVRblvkMBrjp73cmfbhBnY8Iwzilo37sjQVGgABlTsxGuNNdOo%3D&X-Amz-Signature=45014efd4dbaeabac6ad988778730d4482b61bcb6216dfa510cb0ce7fd4245e9&X-Amz-SignedHeaders=host&response-content-disposition=inline" },
  { id: 102, name: "Proizvod Lojalnosti 2 (Dupli)", currentPointRateFactor: 2, imageUrl: "https://bazaar-backend-storage.s3.eu-north-1.amazonaws.com/2e03ade7-ae40-43c3-a3ba-9f564af82d13.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA4CYEGBQZUUB3PBHT%2F20250523%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Date=20250523T175348Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDoaCmV1LW5vcnRoLTEiRzBFAiAsKQ88Y9tlifXoX4XwyVHpFjY2YqurilA%2BR6KiM8W9agIhAPXS22zSZPbw2YUFi8gS0Ngkx9g1K3iUAspnSQh9P%2BSbKuMCCPP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMODMwNTQ4MDg1ODExIgy6lceqWjQ6a2K%2Fp8kqtwKv5C7HqzDgaIqcSiVyqMNTGUz%2FowIl2AxpmMS6vIV%2BDGUM%2BK1mGAMKOvrOq2ReuRryinWc6s2kCJZt1MOVncEgDacCBPIB5NG8ifTMwbXFhbLS%2BgJsC4eHbYPU6PajTTzxEdSF8s1t0EvJUkd7CurdS6ugrpLQf7vjqXJZxR0E%2BQ6SlCtE1s8nMsjelPFWI64o%2BJk%2F4QpeK3Cmw8CYRDej9iWNjX8Pprg9xEF5TSJGUG2E%2FPTxLmCf9zFE89wAxi8HIs4eErCZwaQjEJnX2PqUA7Yax27OF15mv3grbEYwGi1341uo4pEk7El8DhHgCbC8JSr2k1WKqdKiUhiZZ6wsjUq13z862kPJjDnGwc1262842G13pj%2BIgQFk1VGVOercAQA6gnVlLs3F1dLmCPHpUAsGa8Q3NzCP7MLBBjqtAgiltKdTqTxFcrRUZx1QtjHHXjQ60lwpIjlJXGXr4%2BDBwv3IHlMEsFCI9Ol%2BiXbIj9MDTLTfK5wAx6j1yaVHTcLRTsZmjLHgMvlIVYZ1AzTIM%2BhI%2BwSvy9pOqf17uP1FJ6CkqyDiotnl%2Fy47NbHnFhTwjEZ9FXTk95fZah0pEipDl6EZmNMv%2BzCFxfFGZb5J0FJywTldxo8gMY11cyqvb3htjHgtvfI3NlG%2FLOvfJied2Z95OCr0fCTunXBGDGFZSGn4dOe%2BLXUuVsHoypNe1L%2Bi1b0UyVEvJEVpnmOOUl0DsfVHHomwCYRCJP1qGenK8I7OKmZ3mdGNc2af%2BeQqqFgk%2FZiCgV%2BDdjVRblvkMBrjp73cmfbhBnY8Iwzilo37sjQVGgABlTsxGuNNdOo%3D&X-Amz-Signature=45014efd4dbaeabac6ad988778730d4482b61bcb6216dfa510cb0ce7fd4245e9&X-Amz-SignedHeaders=host&response-content-disposition=inline" },
  { id: 103, name: "Proizvod Lojalnosti 1", currentPointRateFactor: 0, imageUrl: "https://bazaar-backend-storage.s3.eu-north-1.amazonaws.com/2e03ade7-ae40-43c3-a3ba-9f564af82d13.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA4CYEGBQZUUB3PBHT%2F20250523%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Date=20250523T175348Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDoaCmV1LW5vcnRoLTEiRzBFAiAsKQ88Y9tlifXoX4XwyVHpFjY2YqurilA%2BR6KiM8W9agIhAPXS22zSZPbw2YUFi8gS0Ngkx9g1K3iUAspnSQh9P%2BSbKuMCCPP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMODMwNTQ4MDg1ODExIgy6lceqWjQ6a2K%2Fp8kqtwKv5C7HqzDgaIqcSiVyqMNTGUz%2FowIl2AxpmMS6vIV%2BDGUM%2BK1mGAMKOvrOq2ReuRryinWc6s2kCJZt1MOVncEgDacCBPIB5NG8ifTMwbXFhbLS%2BgJsC4eHbYPU6PajTTzxEdSF8s1t0EvJUkd7CurdS6ugrpLQf7vjqXJZxR0E%2BQ6SlCtE1s8nMsjelPFWI64o%2BJk%2F4QpeK3Cmw8CYRDej9iWNjX8Pprg9xEF5TSJGUG2E%2FPTxLmCf9zFE89wAxi8HIs4eErCZwaQjEJnX2PqUA7Yax27OF15mv3grbEYwGi1341uo4pEk7El8DhHgCbC8JSr2k1WKqdKiUhiZZ6wsjUq13z862kPJjDnGwc1262842G13pj%2BIgQFk1VGVOercAQA6gnVlLs3F1dLmCPHpUAsGa8Q3NzCP7MLBBjqtAgiltKdTqTxFcrRUZx1QtjHHXjQ60lwpIjlJXGXr4%2BDBwv3IHlMEsFCI9Ol%2BiXbIj9MDTLTfK5wAx6j1yaVHTcLRTsZmjLHgMvlIVYZ1AzTIM%2BhI%2BwSvy9pOqf17uP1FJ6CkqyDiotnl%2Fy47NbHnFhTwjEZ9FXTk95fZah0pEipDl6EZmNMv%2BzCFxfFGZb5J0FJywTldxo8gMY11cyqvb3htjHgtvfI3NlG%2FLOvfJied2Z95OCr0fCTunXBGDGFZSGn4dOe%2BLXUuVsHoypNe1L%2Bi1b0UyVEvJEVpnmOOUl0DsfVHHomwCYRCJP1qGenK8I7OKmZ3mdGNc2af%2BeQqqFgk%2FZiCgV%2BDdjVRblvkMBrjp73cmfbhBnY8Iwzilo37sjQVGgABlTsxGuNNdOo%3D&X-Amz-Signature=45014efd4dbaeabac6ad988778730d4482b61bcb6216dfa510cb0ce7fd4245e9&X-Amz-SignedHeaders=host&response-content-disposition=inline" },
  { id: 104, name: "Proizvod Lojalnosti 1", currentPointRateFactor: 1, imageUrl: "https://bazaar-backend-storage.s3.eu-north-1.amazonaws.com/2e03ade7-ae40-43c3-a3ba-9f564af82d13.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA4CYEGBQZUUB3PBHT%2F20250523%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Date=20250523T175348Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDoaCmV1LW5vcnRoLTEiRzBFAiAsKQ88Y9tlifXoX4XwyVHpFjY2YqurilA%2BR6KiM8W9agIhAPXS22zSZPbw2YUFi8gS0Ngkx9g1K3iUAspnSQh9P%2BSbKuMCCPP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMODMwNTQ4MDg1ODExIgy6lceqWjQ6a2K%2Fp8kqtwKv5C7HqzDgaIqcSiVyqMNTGUz%2FowIl2AxpmMS6vIV%2BDGUM%2BK1mGAMKOvrOq2ReuRryinWc6s2kCJZt1MOVncEgDacCBPIB5NG8ifTMwbXFhbLS%2BgJsC4eHbYPU6PajTTzxEdSF8s1t0EvJUkd7CurdS6ugrpLQf7vjqXJZxR0E%2BQ6SlCtE1s8nMsjelPFWI64o%2BJk%2F4QpeK3Cmw8CYRDej9iWNjX8Pprg9xEF5TSJGUG2E%2FPTxLmCf9zFE89wAxi8HIs4eErCZwaQjEJnX2PqUA7Yax27OF15mv3grbEYwGi1341uo4pEk7El8DhHgCbC8JSr2k1WKqdKiUhiZZ6wsjUq13z862kPJjDnGwc1262842G13pj%2BIgQFk1VGVOercAQA6gnVlLs3F1dLmCPHpUAsGa8Q3NzCP7MLBBjqtAgiltKdTqTxFcrRUZx1QtjHHXjQ60lwpIjlJXGXr4%2BDBwv3IHlMEsFCI9Ol%2BiXbIj9MDTLTfK5wAx6j1yaVHTcLRTsZmjLHgMvlIVYZ1AzTIM%2BhI%2BwSvy9pOqf17uP1FJ6CkqyDiotnl%2Fy47NbHnFhTwjEZ9FXTk95fZah0pEipDl6EZmNMv%2BzCFxfFGZb5J0FJywTldxo8gMY11cyqvb3htjHgtvfI3NlG%2FLOvfJied2Z95OCr0fCTunXBGDGFZSGn4dOe%2BLXUuVsHoypNe1L%2Bi1b0UyVEvJEVpnmOOUl0DsfVHHomwCYRCJP1qGenK8I7OKmZ3mdGNc2af%2BeQqqFgk%2FZiCgV%2BDdjVRblvkMBrjp73cmfbhBnY8Iwzilo37sjQVGgABlTsxGuNNdOo%3D&X-Amz-Signature=45014efd4dbaeabac6ad988778730d4482b61bcb6216dfa510cb0ce7fd4245e9&X-Amz-SignedHeaders=host&response-content-disposition=inline" },
  { id: 105, name: "Proizvod Peti - Specijalni", currentPointRateFactor: 3, imageUrl: "https://bazaar-backend-storage.s3.eu-north-1.amazonaws.com/2e03ade7-ae40-43c3-a3ba-9f564af82d13.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA4CYEGBQZUUB3PBHT%2F20250523%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Date=20250523T175348Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDoaCmV1LW5vcnRoLTEiRzBFAiAsKQ88Y9tlifXoX4XwyVHpFjY2YqurilA%2BR6KiM8W9agIhAPXS22zSZPbw2YUFi8gS0Ngkx9g1K3iUAspnSQh9P%2BSbKuMCCPP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMODMwNTQ4MDg1ODExIgy6lceqWjQ6a2K%2Fp8kqtwKv5C7HqzDgaIqcSiVyqMNTGUz%2FowIl2AxpmMS6vIV%2BDGUM%2BK1mGAMKOvrOq2ReuRryinWc6s2kCJZt1MOVncEgDacCBPIB5NG8ifTMwbXFhbLS%2BgJsC4eHbYPU6PajTTzxEdSF8s1t0EvJUkd7CurdS6ugrpLQf7vjqXJZxR0E%2BQ6SlCtE1s8nMsjelPFWI64o%2BJk%2F4QpeK3Cmw8CYRDej9iWNjX8Pprg9xEF5TSJGUG2E%2FPTxLmCf9zFE89wAxi8HIs4eErCZwaQjEJnX2PqUA7Yax27OF15mv3grbEYwGi1341uo4pEk7El8DhHgCbC8JSr2k1WKqdKiUhiZZ6wsjUq13z862kPJjDnGwc1262842G13pj%2BIgQFk1VGVOercAQA6gnVlLs3F1dLmCPHpUAsGa8Q3NzCP7MLBBjqtAgiltKdTqTxFcrRUZx1QtjHHXjQ60lwpIjlJXGXr4%2BDBwv3IHlMEsFCI9Ol%2BiXbIj9MDTLTfK5wAx6j1yaVHTcLRTsZmjLHgMvlIVYZ1AzTIM%2BhI%2BwSvy9pOqf17uP1FJ6CkqyDiotnl%2Fy47NbHnFhTwjEZ9FXTk95fZah0pEipDl6EZmNMv%2BzCFxfFGZb5J0FJywTldxo8gMY11cyqvb3htjHgtvfI3NlG%2FLOvfJied2Z95OCr0fCTunXBGDGFZSGn4dOe%2BLXUuVsHoypNe1L%2Bi1b0UyVEvJEVpnmOOUl0DsfVHHomwCYRCJP1qGenK8I7OKmZ3mdGNc2af%2BeQqqFgk%2FZiCgV%2BDdjVRblvkMBrjp73cmfbhBnY8Iwzilo37sjQVGgABlTsxGuNNdOo%3D&X-Amz-Signature=45014efd4dbaeabac6ad988778730d4482b61bcb6216dfa510cb0ce7fd4245e9&X-Amz-SignedHeaders=host&response-content-disposition=inline"  },
  { id: 106, name: "Proizvod Peti - Specijalni", currentPointRateFactor: 3, imageUrl: "https://bazaar-backend-storage.s3.eu-north-1.amazonaws.com/2e03ade7-ae40-43c3-a3ba-9f564af82d13.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA4CYEGBQZUUB3PBHT%2F20250523%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Date=20250523T175348Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDoaCmV1LW5vcnRoLTEiRzBFAiAsKQ88Y9tlifXoX4XwyVHpFjY2YqurilA%2BR6KiM8W9agIhAPXS22zSZPbw2YUFi8gS0Ngkx9g1K3iUAspnSQh9P%2BSbKuMCCPP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMODMwNTQ4MDg1ODExIgy6lceqWjQ6a2K%2Fp8kqtwKv5C7HqzDgaIqcSiVyqMNTGUz%2FowIl2AxpmMS6vIV%2BDGUM%2BK1mGAMKOvrOq2ReuRryinWc6s2kCJZt1MOVncEgDacCBPIB5NG8ifTMwbXFhbLS%2BgJsC4eHbYPU6PajTTzxEdSF8s1t0EvJUkd7CurdS6ugrpLQf7vjqXJZxR0E%2BQ6SlCtE1s8nMsjelPFWI64o%2BJk%2F4QpeK3Cmw8CYRDej9iWNjX8Pprg9xEF5TSJGUG2E%2FPTxLmCf9zFE89wAxi8HIs4eErCZwaQjEJnX2PqUA7Yax27OF15mv3grbEYwGi1341uo4pEk7El8DhHgCbC8JSr2k1WKqdKiUhiZZ6wsjUq13z862kPJjDnGwc1262842G13pj%2BIgQFk1VGVOercAQA6gnVlLs3F1dLmCPHpUAsGa8Q3NzCP7MLBBjqtAgiltKdTqTxFcrRUZx1QtjHHXjQ60lwpIjlJXGXr4%2BDBwv3IHlMEsFCI9Ol%2BiXbIj9MDTLTfK5wAx6j1yaVHTcLRTsZmjLHgMvlIVYZ1AzTIM%2BhI%2BwSvy9pOqf17uP1FJ6CkqyDiotnl%2Fy47NbHnFhTwjEZ9FXTk95fZah0pEipDl6EZmNMv%2BzCFxfFGZb5J0FJywTldxo8gMY11cyqvb3htjHgtvfI3NlG%2FLOvfJied2Z95OCr0fCTunXBGDGFZSGn4dOe%2BLXUuVsHoypNe1L%2Bi1b0UyVEvJEVpnmOOUl0DsfVHHomwCYRCJP1qGenK8I7OKmZ3mdGNc2af%2BeQqqFgk%2FZiCgV%2BDdjVRblvkMBrjp73cmfbhBnY8Iwzilo37sjQVGgABlTsxGuNNdOo%3D&X-Amz-Signature=45014efd4dbaeabac6ad988778730d4482b61bcb6216dfa510cb0ce7fd4245e9&X-Amz-SignedHeaders=host&response-content-disposition=inline"  },
  { id: 107, name: "Proizvod Peti - Specijalni", currentPointRateFactor: 3, imageUrl: "https://bazaar-backend-storage.s3.eu-north-1.amazonaws.com/2e03ade7-ae40-43c3-a3ba-9f564af82d13.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA4CYEGBQZUUB3PBHT%2F20250523%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Date=20250523T175348Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDoaCmV1LW5vcnRoLTEiRzBFAiAsKQ88Y9tlifXoX4XwyVHpFjY2YqurilA%2BR6KiM8W9agIhAPXS22zSZPbw2YUFi8gS0Ngkx9g1K3iUAspnSQh9P%2BSbKuMCCPP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMODMwNTQ4MDg1ODExIgy6lceqWjQ6a2K%2Fp8kqtwKv5C7HqzDgaIqcSiVyqMNTGUz%2FowIl2AxpmMS6vIV%2BDGUM%2BK1mGAMKOvrOq2ReuRryinWc6s2kCJZt1MOVncEgDacCBPIB5NG8ifTMwbXFhbLS%2BgJsC4eHbYPU6PajTTzxEdSF8s1t0EvJUkd7CurdS6ugrpLQf7vjqXJZxR0E%2BQ6SlCtE1s8nMsjelPFWI64o%2BJk%2F4QpeK3Cmw8CYRDej9iWNjX8Pprg9xEF5TSJGUG2E%2FPTxLmCf9zFE89wAxi8HIs4eErCZwaQjEJnX2PqUA7Yax27OF15mv3grbEYwGi1341uo4pEk7El8DhHgCbC8JSr2k1WKqdKiUhiZZ6wsjUq13z862kPJjDnGwc1262842G13pj%2BIgQFk1VGVOercAQA6gnVlLs3F1dLmCPHpUAsGa8Q3NzCP7MLBBjqtAgiltKdTqTxFcrRUZx1QtjHHXjQ60lwpIjlJXGXr4%2BDBwv3IHlMEsFCI9Ol%2BiXbIj9MDTLTfK5wAx6j1yaVHTcLRTsZmjLHgMvlIVYZ1AzTIM%2BhI%2BwSvy9pOqf17uP1FJ6CkqyDiotnl%2Fy47NbHnFhTwjEZ9FXTk95fZah0pEipDl6EZmNMv%2BzCFxfFGZb5J0FJywTldxo8gMY11cyqvb3htjHgtvfI3NlG%2FLOvfJied2Z95OCr0fCTunXBGDGFZSGn4dOe%2BLXUuVsHoypNe1L%2Bi1b0UyVEvJEVpnmOOUl0DsfVHHomwCYRCJP1qGenK8I7OKmZ3mdGNc2af%2BeQqqFgk%2FZiCgV%2BDdjVRblvkMBrjp73cmfbhBnY8Iwzilo37sjQVGgABlTsxGuNNdOo%3D&X-Amz-Signature=45014efd4dbaeabac6ad988778730d4482b61bcb6216dfa510cb0ce7fd4245e9&X-Amz-SignedHeaders=host&response-content-disposition=inline"  },
  { id: 108, name: "Proizvod Peti - Specijalni", currentPointRateFactor: 3, imageUrl: "https://bazaar-backend-storage.s3.eu-north-1.amazonaws.com/2e03ade7-ae40-43c3-a3ba-9f564af82d13.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA4CYEGBQZUUB3PBHT%2F20250523%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Date=20250523T175348Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDoaCmV1LW5vcnRoLTEiRzBFAiAsKQ88Y9tlifXoX4XwyVHpFjY2YqurilA%2BR6KiM8W9agIhAPXS22zSZPbw2YUFi8gS0Ngkx9g1K3iUAspnSQh9P%2BSbKuMCCPP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMODMwNTQ4MDg1ODExIgy6lceqWjQ6a2K%2Fp8kqtwKv5C7HqzDgaIqcSiVyqMNTGUz%2FowIl2AxpmMS6vIV%2BDGUM%2BK1mGAMKOvrOq2ReuRryinWc6s2kCJZt1MOVncEgDacCBPIB5NG8ifTMwbXFhbLS%2BgJsC4eHbYPU6PajTTzxEdSF8s1t0EvJUkd7CurdS6ugrpLQf7vjqXJZxR0E%2BQ6SlCtE1s8nMsjelPFWI64o%2BJk%2F4QpeK3Cmw8CYRDej9iWNjX8Pprg9xEF5TSJGUG2E%2FPTxLmCf9zFE89wAxi8HIs4eErCZwaQjEJnX2PqUA7Yax27OF15mv3grbEYwGi1341uo4pEk7El8DhHgCbC8JSr2k1WKqdKiUhiZZ6wsjUq13z862kPJjDnGwc1262842G13pj%2BIgQFk1VGVOercAQA6gnVlLs3F1dLmCPHpUAsGa8Q3NzCP7MLBBjqtAgiltKdTqTxFcrRUZx1QtjHHXjQ60lwpIjlJXGXr4%2BDBwv3IHlMEsFCI9Ol%2BiXbIj9MDTLTfK5wAx6j1yaVHTcLRTsZmjLHgMvlIVYZ1AzTIM%2BhI%2BwSvy9pOqf17uP1FJ6CkqyDiotnl%2Fy47NbHnFhTwjEZ9FXTk95fZah0pEipDl6EZmNMv%2BzCFxfFGZb5J0FJywTldxo8gMY11cyqvb3htjHgtvfI3NlG%2FLOvfJied2Z95OCr0fCTunXBGDGFZSGn4dOe%2BLXUuVsHoypNe1L%2Bi1b0UyVEvJEVpnmOOUl0DsfVHHomwCYRCJP1qGenK8I7OKmZ3mdGNc2af%2BeQqqFgk%2FZiCgV%2BDdjVRblvkMBrjp73cmfbhBnY8Iwzilo37sjQVGgABlTsxGuNNdOo%3D&X-Amz-Signature=45014efd4dbaeabac6ad988778730d4482b61bcb6216dfa510cb0ce7fd4245e9&X-Amz-SignedHeaders=host&response-content-disposition=inline"  },
];

// Dohvata proizvode Sellera sa njihovim loyalty postavkama
export async function apiFetchSellerProductsWithLoyalty(storeId: number): Promise<ProductLoyaltySetting[]> {
  console.log(`API MOCK: Fetching products with loyalty settings for store ${storeId}`);
  // TODO: Implementiraj stvarni API poziv
  // Primer sa Axiosom:
  // const response = await api.get<ProductLoyaltySetting[]>(`/loyalty/store/${storeId}/products`);
  // return response.data;
  return new Promise(resolve => setTimeout(() => resolve([...MOCK_PRODUCTS_LOYALTY_DB]), 1000));
}

// Ažurira PointRate za specifični proizvod
export async function apiUpdateProductPointRate(
  productId: number,
  storeId: number, 
  newPointRateFactor: number
): Promise<ProductLoyaltySetting | null> {
  console.log(`API MOCK: Updating product ${productId} in store ${storeId} to newPointRateFactor ${newPointRateFactor}`);
  // TODO: Implementiraj stvarni API poziv
  // Primjer sa Axiosom:
  // const response = await api.put<ProductLoyaltySetting>(`/product/${productId}/point-rate`, { pointRateFactor: newPointRateFactor });
  // return response.data;

  if (Math.random() > 0.1) { 
    const productIndex = MOCK_PRODUCTS_LOYALTY_DB.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      MOCK_PRODUCTS_LOYALTY_DB[productIndex] = { ...MOCK_PRODUCTS_LOYALTY_DB[productIndex], currentPointRateFactor: newPointRateFactor };
      return { ...MOCK_PRODUCTS_LOYALTY_DB[productIndex] };
    }
  }
  return null;
}

// Dohvata podatke za loyalty izvještaj
export async function apiFetchLoyaltyReport(
  storeId: number,
  dateFrom?: string,
  dateTo?: string
){ 
  try {
    console.log("from: ", dateFrom)
    console.log("to: ", dateTo)
    const totalIncome = await api.get('/Stores/income', {
      params: {
        from: dateFrom,
        to: dateTo
      }
    });

    const pointsGiven = await api.get('/Stores/points', {
      params: {
        from: dateFrom,
        to: dateTo
      }
    });

    const paidToAdmin = await api.get('/Loyalty/admin/income', {
      params: {
        from: dateFrom,
        to: dateTo,
        storeIds: [storeId]
      }
    });

    const compensation = await api.get(`/Loyalty/store/${storeId}/income`, {
      params: {
        from: dateFrom,
        to: dateTo
      }
    });

    const adminToSellerRate = await api.get('/Loyalty/consts/admin/seller');

    if (totalIncome.data && pointsGiven && paidToAdmin && compensation && adminToSellerRate) {
      const returnedPoints = Math.round(compensation.data / adminToSellerRate.data);
      return new Promise(resolve => setTimeout(() => resolve({
        totalIncome: totalIncome.data.totalIncome,
        pointsGiven: pointsGiven.data,
        paidToAdmin: paidToAdmin.data,
        pointsUsed: returnedPoints,
        compensatedAmount: compensation.data
      }), 800));
    }

    return null; 
  } catch (error) {
    console.error('Failed to fetch total income:', error);
    return null; 
  }

}