package affiliate

// AffiliateNetworkConfig 对应AffiliateNetwork表
type AffiliateNetworkConfig struct {
	Id                int64
	UserId            int64
	Name              string
	Hash              string
	PostbackUrl       string
	AppendClickId     int
	DuplicatePostback int
	IpWhiteList       []string
}
