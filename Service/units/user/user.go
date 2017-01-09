package user

import (
	"net/http"
)

type UserConfig struct {
}

type User struct {
	c UserConfig
}

func (u *User) Create() error {
	return nil
}

func (u *User) Destroy() error {
	return nil
}

func (u *User) Update(c UserConfig) error {
	return nil
}

func (u *User) OnLPOfferRequest(w http.ResponseWriter, r *http.Request) error {
	return nil
}

func (u *User) OnLandingPageClick(w http.ResponseWriter, r *http.Request) error {
	return nil
}

func (u *User) OnOfferPostback(w http.ResponseWriter, r *http.Request) error {
	return nil
}

func (u *User) AddCampaign() error {
	return nil
}
func (u *User) UpdateCampaign() error {
	return nil
}
func (u *User) DelCampaign() error {
	return nil
}

func (u *User) AddFlow() error {
	return nil
}
func (u *User) UpdateFlow() error {
	return nil
}
func (u *User) DelFlow() error {
	return nil
}

func (u *User) AddRule() error {
	return nil
}
func (u *User) UpdateRule() error {
	return nil
}
func (u *User) DelRule() error {
	return nil
}

func (u *User) AddPath() error {
	return nil
}
func (u *User) UpdatePath() error {
	return nil
}
func (u *User) DelPath() error {
	return nil
}

func (u *User) AddLander() error {
	return nil
}
func (u *User) UpdateLander() error {
	return nil
}
func (u *User) DelLander() error {
	return nil
}

func (u *User) AddOffer() error {
	return nil
}
func (u *User) UpdateOffer() error {
	return nil
}
func (u *User) DelOffer() error {
	return nil
}
