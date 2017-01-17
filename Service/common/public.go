package common

const (
	UrlTokenClickId       = "cid"
	UrlTokenPayout        = "payout"
	UrlTokenTransactionId = "txid"
)

// TrafficSourceParams {"Parameter":"X","Placeholder":"X","Name":"X","Track":N(0,1)}
type TrafficSourceParams struct {
	Parameter   string
	Placeholder string
	Name        string
	Track       int
}
